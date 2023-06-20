const { Sequelize, Op } = require('sequelize');

const ERRORS = require('../constants/errors');
const { MEDIA_TYPES } = require('../constants/media');
const { VALIDATION_RULES } = require('../constants/validation');
const { USERS_PER_PAGE, USERS_SORT_BY } = require('../constants/users');
const { SORTING_ORDER, SORTING_ORDERS } = require('../constants/sorting');

const { errorFactory } = require('../utils/error-factory');
const { upload, removeLocalFile } = require('../utils/upload');
const { isEmail } = require('../utils/validators');

const database = require('../models');

const { User } = database.sequelize.models;

module.exports = {
    async updateUser(ctx) {
        const user = ctx.user;
        const { body, files } = ctx.request;
        const name = body?.name;
        const email = body?.email;
        const fileAvatar = files?.avatar ?? null;

        const validation = { name: [], email: [] };

        if (name != null && !name.trim()) {
            validation.name.push({ rule: VALIDATION_RULES.REQUIRED });
        }

        if (email != null) {
            if (!email.trim()) {
                validation.email.push({ rule: VALIDATION_RULES.REQUIRED });
            } else if (!isEmail(email)) {
                validation.email.push({ rule: VALIDATION_RULES.NOT_EMAIL });
            }
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, { data: validation });
        }

        if (fileAvatar != null) {
            const cloudVideo = await upload(fileAvatar.newFilename, 'image');

            removeLocalFile(fileAvatar.newFilename);

            const oldMedia = await user.getAvatar();

            if (oldMedia) {
                await oldMedia.destroy();
            }

            await user.createAvatar({
                externalId: cloudVideo.public_id,
                type: MEDIA_TYPES.IMAGE,
            });
        }

        if (name != null) {
            user.name = name;
        }

        if (email != null) {
            user.email = email;
        }

        await user.save();

        const updatedUser = await User.findByPk(user.id, { include: 'avatar' });

        ctx.body = await updatedUser.serialize(ctx.user);
    },

    async getUser(ctx) {
        let { userId } = ctx.params;

        if (userId === 'self') {
            if (ctx.user) {
                userId = ctx.user.id;
            } else {
                throw errorFactory(401, ERRORS.NOT_AUTHENTICATED);
            }
        }

        const user = await User.findByPk(userId, { include: 'avatar' });

        if (!user) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        ctx.body = await user.serialize(ctx.user);
    },

    async subscribe(ctx) {
        const { userId } = ctx.params;

        if (userId === ctx.user?.id) {
            throw errorFactory(400, ERRORS.VALIDATION);
        }

        const user = await User.findByPk(userId, { include: 'avatar' });

        if (!user) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        await user.addSubscriber(ctx.user);

        ctx.body = { success: true };
    },

    async unsubscribe(ctx) {
        const { userId } = ctx.params;

        if (userId === ctx.user?.id) {
            throw errorFactory(400, ERRORS.VALIDATION);
        }

        const user = await User.findByPk(userId, { include: 'avatar' });

        if (!user) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        await user.removeSubscriber(ctx.user);

        ctx.body = { success: true };
    },

    async getSubscriptions(ctx) {
        const { userId } = ctx.params;

        const user = userId == ctx.user?.id ? ctx.user : await User.findByPk(userId);

        if (!user) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        let { page, perPage, order, sortBy } = ctx.query;
        page = page ?? 1;
        perPage = +(perPage ?? USERS_PER_PAGE);
        order = SORTING_ORDERS.includes(order) ? order : SORTING_ORDER.DESC;
        sortBy = USERS_SORT_BY.includes(sortBy) ? sortBy : 'createdAt';

        const limit = page * perPage;
        const offset = (page - 1) * perPage;

        const [count, rows] = await Promise.all([
            user.countSubscription(),
            user.getSubscription({
                limit,
                offset,
                order: [[sortBy, order]],
            }),
        ]);

        const data = await Promise.all(rows.map(u => u.serializeMin(ctx.user)));
        const totalPages = Math.ceil(count / perPage);

        ctx.body = {
            pagination: {
                page,
                perPage,
                total: count,
                totalPages,
            },
            data,
        };
    },

    async getSubscribers(ctx) {
        const { userId } = ctx.params;

        const user = userId == ctx.user?.id ? ctx.user : await User.findByPk(userId);

        if (!user) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        let { page, perPage, order, sortBy } = ctx.query;
        page = page ?? 1;
        perPage = +(perPage ?? USERS_PER_PAGE);
        order = SORTING_ORDERS.includes(order) ? order : SORTING_ORDER.DESC;
        sortBy = USERS_SORT_BY.includes(sortBy) ? sortBy : 'createdAt';

        const limit = page * perPage;
        const offset = (page - 1) * perPage;

        const [count, rows] = await Promise.all([
            user.countSubscriber(),
            user.getSubscriber({
                limit,
                offset,
                order: [[sortBy, order]],
            }),
        ]);

        const data = await Promise.all(rows.map(u => u.serializeMin(ctx.user)));
        const totalPages = Math.ceil(count / perPage);

        ctx.body = {
            pagination: {
                page,
                perPage,
                total: count,
                totalPages,
            },
            data,
        };
    },

    async getUsers(ctx) {
        let { page, perPage, search, order, sortBy } = ctx.query;
        page = page ?? 1;
        perPage = +(perPage ?? USERS_PER_PAGE);
        order = SORTING_ORDERS.includes(order) ? order : SORTING_ORDER.DESC;
        sortBy = USERS_SORT_BY.includes(sortBy) ? sortBy : 'createdAt';

        const limit = page * perPage;
        const offset = (page - 1) * perPage;

        const where = [];

        if (search) {
            where.push(
                {
                    [Op.or]: [
                        Sequelize.where(
                            Sequelize.fn('MATCH', Sequelize.col('name')),
                            '',
                            Sequelize.fn('AGAINST', search),
                        ),
                        {
                            email: {
                                [Op.eq]: search
                            },
                        },
                    ]
                }
            )
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, order]],
        });

        const data = await Promise.all(rows.map(p => p.serialize(ctx.user)));
        const totalPages = Math.ceil(count / perPage);

        ctx.body = {
            pagination: {
                page,
                perPage,
                total: count,
                totalPages,
            },
            data,
        };
    }
}
