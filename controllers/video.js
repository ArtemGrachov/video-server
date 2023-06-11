const { Op, Sequelize } = require('sequelize');

const ERRORS = require('../constants/errors');
const { COMMENTS_PER_PAGE } = require('../constants/comments');
const { MEDIA_TYPES } = require('../constants/media');
const { VALIDATION_RULES } = require('../constants/validation');
const { VIDEO_PER_PAGE, VIDEO_SORT_BY } = require('../constants/video');

const database = require('../models');

const { errorFactory } = require('../utils/error-factory');
const { upload, removeLocalFile } = require('../utils/upload');
const { SORTING_ORDER, SORTING_ORDERS } = require('../constants/sorting');

const { Video, User } = database.sequelize.models;

module.exports = {
    async createVideo(ctx) {
        const { body, files } = ctx.request;
        const name = body?.name ?? '';
        const description = body?.description ?? '';
        const fileVideo = files?.video ?? null;

        const validation = { name: [], description: [] };

        if (!name.trim()) {
            validation.name.push({ rule: VALIDATION_RULES.REQUIRED });
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, { data: validation });
        }

        const cloudVideo = await upload(fileVideo.newFilename, 'video');

        removeLocalFile(fileVideo.newFilename);

        const video = await Video.create(
            {
                name,
                description,
                authorId: ctx.user.id
            }
        );

        await video.createMedia({
            externalId: cloudVideo.public_id,
            type: MEDIA_TYPES.VIDEO
        });

        ctx.body = await video.serialize();
    },

    async getVideo(ctx) {
        const videoId = ctx.params.id;

        const video = await Video.findByPk(
            videoId,
            {
                include: [
                    'media',
                    {
                        model: User,
                        as: 'author',
                        include: 'avatar',
                    },
                ]
            }
        );

        if (!video) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        ctx.body = await video.serialize(ctx.user);
    },

    async getVideos(ctx) {
        let { page, perPage, userIds, subscriptions, search, sortBy, order } = ctx.query;

        page = page ?? 1;
        perPage = +(perPage ?? VIDEO_PER_PAGE);

        const limit = page * perPage;
        const offset = (page - 1) * perPage;

        const where = [];

        if (ctx.user && subscriptions) {
            const subscriptions = await ctx.user.getSubscription();

            where.push({
                authorId: {
                    [Op.in]: subscriptions.map(u => u.id),
                },
            });
        } else if (userIds) {
            if (typeof userIds === 'object') {
                where.push({
                    authorId: {
                        [Op.in]: userIds,
                    },
                });
            } else {
                where.push({
                    authorId: {
                        [Op.eq]: userIds,
                    }
                });
            }
        }

        if (search) {
            where.push(
                Sequelize.where(
                    Sequelize.fn('MATCH', Sequelize.col('name'), Sequelize.col('description')),
                    '',
                    Sequelize.fn('AGAINST', search),
                )
            )
        }

        order = SORTING_ORDERS.includes(order) ? order : SORTING_ORDER.DESC;
        sortBy = VIDEO_SORT_BY.includes(sortBy) ? sortBy : 'createdAt';

        const { count, rows } = await Video.findAndCountAll({
            where,
            limit,
            offset,
            include: 'media',
            order: [[sortBy, order]],
        });

        const authorIds = Array.from(new Set(rows.map(p => p.authorId)));

        const authors = await User.findAll({
            where: {
                id: {
                    [Op.in]: authorIds
                }
            },
            include: 'avatar',
        });

        const [data, users] = await Promise.all([
            Promise.all(rows.map(v => v.serialize(ctx.user))),
            Promise.all(authors.map(u => u.serializeMin(ctx.user)))
        ]);

        const totalPages = Math.ceil(count / perPage);

        ctx.body = {
            pagination: {
                page,
                perPage,
                total: count,
                totalPages,
            },
            data,
            users,
        };
    },

    async deleteVideo(ctx) {
        const videoId = ctx.params.id;

        const video = await Video.findByPk(videoId);

        await video.destroy();

        ctx.body = { success: true };
    },

    async updateVideo(ctx) {
        const { body, files } = ctx.request;

        const name = body?.name;
        const description = body?.description;
        const fileVideo = files?.video ?? null;

        const validation = { name: [], description: [] };

        if (name != null && !name.trim()) {
            validation.name.push({ rule: VALIDATION_RULES.REQUIRED });
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, { data: validation });
        }

        const videoId = ctx.params.id;
        const video = await Video.findByPk(videoId);

        if (name != null) {
            video.name = name;
        }

        if (description != null) {
            video.description = description;
        }

        if (fileVideo != null) {
            const cloudVideo = await upload(fileVideo.newFilename, 'video');

            removeLocalFile(fileVideo.newFilename);

            const oldMedia = await video.getMedia();

            if (oldMedia) {
                await oldMedia.destroy();
            }

            await video.createMedia({
                externalId: cloudVideo.public_id,
                type: MEDIA_TYPES.VIDEO
            });
        }

        await video.save();

        const videoUpdated = await Video.findByPk(videoId);

        ctx.body = videoUpdated.serialize();
    },

    async videoCreateComment(ctx) {
        const videoId = ctx.params.id;
        const { body } = ctx.request;
        const content = body?.content ?? '';

        const validation = { content: [] };

        if (!content.trim()) {
            validation.content.push({ rule: VALIDATION_RULES.REQUIRED });
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, { data: validation });
        }

        const video = await Video.findByPk(videoId);

        if (!video) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        const comment = await video.createComment({
            content,
            authorId: ctx.user.id
        });

        ctx.body = await comment.serialize(ctx.user);
    },

    async videoGetComments(ctx) {
        const videoId = ctx.params.id;
        const video = await Video.findByPk(videoId);

        if (!video) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        let { page, perPage, order, sortBy } = ctx.query;
        page = page ?? 1;
        perPage = +(perPage ?? COMMENTS_PER_PAGE);

        const limit = page * perPage;
        const offset = (page - 1) * perPage;
        order = SORTING_ORDERS.includes(order) ? order : SORTING_ORDER.DESC;
        sortBy = VIDEO_SORT_BY.includes(sortBy) ? sortBy : 'createdAt';

        const [count, rows] = await Promise.all([
            video.countComments(),
            video.getComments({
                limit,
                offset,
                order: [[sortBy, order]],
            }),
        ]);

        const authorIds = Array.from(new Set(rows.map(c => c.authorId)));

        const authors = await User.findAll({
            where: {
                id: {
                    [Op.in]: authorIds
                }
            },
            include: 'avatar',
        });

        const [data, users] = await Promise.all([
            Promise.all(rows.map(c => c.serialize(ctx.user))),
            Promise.all(authors.map(u => u.serializeMin(ctx.user)))
        ]);

        const totalPages = Math.ceil(count / perPage);

        ctx.body = {
            pagination: {
                page,
                perPage,
                total: count,
                totalPages,
            },
            data,
            users,
        };
    },

    async likeVideo(ctx) {
        const videoId = ctx.params.id;

        const video = await Video.findByPk(videoId);

        if (!video) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        await video.addLike(ctx.user);
        const count = await video.countLikes();

        ctx.body = { count };
    },

    async removeLikeVideo(ctx) {
        const videoId = ctx.params.id;

        const video = await Video.findByPk(videoId);

        if (!video) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        await video.removeLike(ctx.user);
        const count = await video.countLikes();

        ctx.body = { count };
    }
};
