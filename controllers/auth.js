const bcrypt = require('bcryptjs');

const { ERRORS } = require('../constants/errors');
const { VALIDATION_RULES } = require('../constants/validation');

const database = require('../models');

const { isEmail, validatePassword } = require('../utils/validators');
const { errorFactory } = require('../utils/error-factory');

const { User } = database.sequelize.models;

module.exports = {
    async registration(ctx) {
        try {
            const { body } = ctx.request;

            const name = body.name ?? '';
            const email = body.email ?? '';
            const password = body.password ?? '';

            const validation = { name: [], email: [], password: [] };

            if (!name.trim()) {
                validation.name.push({ rule: VALIDATION_RULES.REQUIRED });
            }

            if (!email.trim()) {
                validation.email.push({ rule: VALIDATION_RULES.REQUIRED });
            } else if (!isEmail(email)) {
                validation.email.push({ rule: VALIDATION_RULES.NOT_EMAIL });
            }

            if (!password.trim()) {
                validation.password.push({ rule: VALIDATION_RULES.REQUIRED });
            } else if (!validatePassword(password)) {
                validation.password.push({ rule: VALIDATION_RULES.VALIDATION_RULES })
            }

            if (Object.keys(validation).some(k => validation[k].length)) {
                throw errorFactory(400, ERRORS.VALIDATION, validation);
            }

            const passwordHash = await bcrypt.hash(password, 10);

            await User.create({
                name,
                email,
                password: passwordHash
            });

            ctx.body = { success: true };
        } catch (error) {
            console.log(error);
            ctx.status = error?.code ?? 500;
            ctx.body = error?.data;
        }
    },

    async logIn(ctx) {
        try {
            const { body } = ctx.request;

            const email = body.email ?? '';
            const password = body.password ?? '';

            const validation = { email: [], password: [] };

            if (!email.trim()) {
                validation.email.push({ rule: VALIDATION_RULES.REQUIRED });
            } else if (!isEmail(email)) {
                validation.email.push({ rule: VALIDATION_RULES.NOT_EMAIL });
            }

            if (!password.trim()) {
                validation.password.push({ rule: VALIDATION_RULES.REQUIRED });
            } else if (!validatePassword(password)) {
                validation.password.push({ rule: VALIDATION_RULES.VALIDATION_RULES })
            }

            if (Object.keys(validation).some(k => validation[k].length)) {
                throw errorFactory(400, ERRORS.VALIDATION, validation);
            }

            const user = await User.findOne({
                where: {
                    email
                }
            });

            if (!user) {
                throw errorFactory(401, ERRORS.INCORRECT_EMAIL_OR_PASSWORD);
            }

            const passwordCheck = await bcrypt.compare(password, user.password);

            if (!passwordCheck) {
                throw errorFactory(401, ERRORS.INCORRECT_EMAIL_OR_PASSWORD);
            }

            const tokens = user.getAuthTokens();

            ctx.status = 200;
            ctx.body = tokens;
        } catch (error) {
            console.log(error);
            ctx.status = error?.code ?? 500;
            ctx.body = error?.data;
        }
    }
};
