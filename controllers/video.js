const { Op } = require('sequelize');

const ERRORS = require('../constants/errors');
const { COMMENTS_PER_PAGE } = require('../constants/comments');
const { MEDIA_TYPES } = require('../constants/media');
const { VALIDATION_RULES } = require('../constants/validation');
const { VIDEO_PER_PAGE } = require('../constants/video');

const database = require('../models');

const { errorFactory } = require('../utils/error-factory');
const { upload, removeLocalFile } = require('../utils/upload');

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
            throw errorFactory(400, ERRORS.VALIDATION, validation);
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

        ctx.body = video.serialize();
    },

    async getVideo(ctx) {
        const videoId = ctx.params.id;

        const video = await Video.findByPk(videoId, { include: 'media' });

        if (!video) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        ctx.body = await video.serialize();
    },

    async getVideos(ctx) {
        let { page, perPage, userIds, subscriptions } = ctx.query;

        page = page ?? 1;
        perPage = perPage ?? VIDEO_PER_PAGE;

        const limit = page * perPage;
        const offset = (page - 1) * perPage;

        const where = {};

        if (ctx.user && subscriptions) {
            const subscriptions = await ctx.user.getSubscription();

            where.authorId = {
                [Op.in]: subscriptions.map(u => u.id),
            };
        } else if (userIds) {
            if (typeof userIds === 'object') {
                where.authorId = {
                    [Op.in]: userIds,
                };
            } else {
                where.authorId = {
                    [Op.eq]: userIds,
                };
            }
        }

        const { count, rows } = await Video.findAndCountAll({
            where,
            limit,
            offset,
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

        ctx.body = {
            pagination: {
                page,
                perPage,
                total: count,
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
            throw errorFactory(400, ERRORS.VALIDATION, validation);
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
            throw errorFactory(400, ERRORS.VALIDATION, validation);
        }

        const video = await Video.findByPk(videoId);

        if (!video) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        const comment = await video.createComment({
            content,
            authorId: ctx.user.id
        });

        ctx.body = await comment.serialize();
    },

    async videoGetComments(ctx) {
        const videoId = ctx.params.id;
        const video = await Video.findByPk(videoId);

        if (!video) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        let { page, perPage } = ctx.query;
        page = page ?? 1;
        perPage = perPage ?? COMMENTS_PER_PAGE;

        const limit = page * perPage;
        const offset = (page - 1) * perPage;

        const [count, rows] = await Promise.all([
            video.countComments(),
            video.getComments({
                limit,
                offset,
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

        ctx.body = {
            pagination: {
                page,
                perPage,
                total: count,
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
