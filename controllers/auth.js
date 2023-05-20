const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { VALIDATION_RULES } = require('../constants/validation');
const { SUCCESS } = require('../constants/success');
const { ERRORS } = require('../constants/errors');

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
    },

    async refreshToken(ctx) {
        try {
            const { refreshToken } = ctx.request.body;

            let decodedToken;

            try {
                decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
            } catch (err) {
                console.log(err);
                throw errorFactory(401, ERRORS.INVALID_REFRESH_TOKEN);
            }

            const { userId } = decodedToken;

            const user = await User.findByPk(userId);

            const tokens = user.getAuthTokens();

            ctx.status = 200;
            ctx.body = tokens;
        } catch (error) {
            console.log(error);
            ctx.status = error?.code ?? 500;
            ctx.body = error?.data;
        }
    },

    async generatePasswordResetToken(ctx) {
        try {
            const { email } = ctx.request.body;

            const user = await User.findOne({ email });

            if (!user) {
                throw errorFactory(400, ERRORS.VALIDATION);
            }

            const resetPasswordToken = user.getResetPasswordToken();

            // @todo
            console.log(`Token: ${resetPasswordToken}`);

            ctx.status = 200;
            ctx.body = {
                message: SUCCESS.RESET_PASSWORD_TOKEN_GENERATED_SUCCESSFULLY
            };
        } catch (error) {
            console.log(error);
            ctx.status = error?.code ?? 500;
            ctx.body = error?.data;
        }
    },

    async resetPassword(ctx) {
        try {
            const { resetPasswordToken, password, passwordConfirmation } = ctx.request.body;

            let decodedToken;

            try {
                decodedToken = jwt.verify(resetPasswordToken, process.env.RESET_PASSWORD_TOKEN);
            } catch (err) {
                throw errorFactory(401, ERRORS.INVALID_RESET_PASSWORD_TOKEN);
            }

            const { userId } = decodedToken;

            const user = await User.findByPk(userId);

            if (!user) {
                throw errorFactory(401, ERRORS.INVALID_RESET_PASSWORD_TOKEN);
            }

            const validation = { password: [], passwordConfirmation: [] };

            if (!password.trim()) {
                validation.password.push({ rule: VALIDATION_RULES.REQUIRED });
            } else if (!validatePassword(password)) {
                validation.password.push({ rule: VALIDATION_RULES.VALIDATION_RULES })
            }

            if (!passwordConfirmation.trim()) {
                validation.passwordConfirmation.push({ rule: VALIDATION_RULES.REQUIRED });
            } else if (password !== passwordConfirmation) {
                validation.passwordConfirmation.push({ rule: VALIDATION_RULES.REQUIRED });
            }

            if (Object.keys(validation).some(k => validation[k].length)) {
                throw errorFactory(400, ERRORS.VALIDATION, validation);
            }

            const passwordHash = await bcrypt.hash(password, 10);

            user.password = passwordHash;

            await user.save();

            ctx.status = 200;
            ctx.body = {
                message: SUCCESS.PASWORD_UPDATED_SUCCESSFULLY
            };
        } catch (error) {
            console.log(error);
            ctx.status = error?.code ?? 500;
            ctx.body = error?.data;
        }
    }
};
