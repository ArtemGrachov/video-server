const { Op, Sequelize } = require('sequelize');

const ERRORS = require('../constants/errors');
const { PLAYLISTS_PER_PAGE, PLAYLISTS_SORT_BY } = require('../constants/playlists');
const { VALIDATION_RULES } = require('../constants/validation');
const { VIDEO_PER_PAGE } = require('../constants/video');
const { SORTING_ORDER, SORTING_ORDERS } = require('../constants/sorting');

const database = require('../models');

const { errorFactory } = require('../utils/error-factory');

const { Playlist, User, Video } = database.sequelize.models;

module.exports = {
    async createPlaylist(ctx) {
        const { body } = ctx.request;
        const name = body?.name;
        const description = body?.description;

        const validation = { name: [], description: [] };

        if (!name.trim()) {
            validation.name.push({ rule: VALIDATION_RULES.REQUIRED });
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, { data: validation });
        }

        const playlist = await Playlist.create({
            name,
            description,
            authorId: ctx.user.id
        });

        ctx.body = await playlist.serialize(ctx.user);
    },

    async getPlaylist(ctx) {
        const playlistId = ctx.params.id;

        const playlist = await Playlist.findByPk(
            playlistId,
            {
                include: [
                    {
                        model: User,
                        as: 'author',
                        include: 'avatar'
                    }
                ]
            }
        );

        if (!playlist) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        ctx.body = await playlist.serialize(ctx.user);
    },

    async getPlaylists(ctx) {
        let { page, perPage, userIds, search, order, sortBy } = ctx.query;
        page = +(page ?? 1);
        perPage = +(perPage ?? PLAYLISTS_PER_PAGE);
        order = SORTING_ORDERS.includes(order) ? order : SORTING_ORDER.DESC;
        sortBy = PLAYLISTS_SORT_BY.includes(sortBy) ? sortBy : 'createdAt';

        const offset = (page - 1) * perPage;

        const where = [];

        if (userIds) {
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

        const { count, rows } = await Playlist.findAndCountAll({
            where,
            limit: perPage,
            offset,
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
            Promise.all(rows.map(p => p.serialize(ctx.user))),
            Promise.all(authors.map(u => u.serializeMin(ctx.user)))
        ]);
        const totalPages = Math.ceil(count / perPage);

        ctx.body = {
            pagination: {
                page,
                perPage,
                total: count,
                totalPages,
                limit: perPage,
                offset
            },
            data,
            users
        };
    },

    async deletePlaylist(ctx) {
        const playlistId = ctx.params.id;

        const playlist = await Playlist.findByPk(playlistId);

        await playlist.destroy();

        ctx.body = { success: true };
    },

    async updatePlaylist(ctx) {
        const { body } = ctx.request;

        const name = body?.name;
        const description = body?.description;

        const validation = { name: [], description: [] };

        if (name != null && !name.trim()) {
            validation.name.push({ rule: VALIDATION_RULES.REQUIRED });
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, { data: validation });
        }

        const playlistId = ctx.params.id;
        const playlist = await Playlist.findByPk(playlistId);

        if (name != null) {
            playlist.name = name;
        }

        if (description != null) {
            playlist.description = description;
        }

        await playlist.save();

        const playlistUpdated = await Playlist.findByPk(playlistId);

        ctx.body = await playlistUpdated.serialize(ctx.user);
    },

    async addVideosToPlaylist(ctx) {
        const { body } = ctx.request;
        const videoIds = body?.videoIds ?? [];

        const validation = { videoIds: [] };

        if (!videoIds.length) {
            validation.videoIds.push({ rule: VALIDATION_RULES.MIN_LENGTH, minLength: 1 });
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, { data: validation });
        }

        const playlistId = ctx.params.id;
        const playlist = await Playlist.findByPk(playlistId);

        const videos = await Video.findAll({
            where: {
                id: {
                    [Op.in]: videoIds
                }
            }
        });

        await playlist.addPlaylistVideos(videos);

        ctx.body = { success: true };
    },

    async removeVideoFromPlaylist(ctx) {
        const { id: playlistId, videoId } = ctx.params;
        const [playlist, video] = await Promise.all([
            Playlist.findByPk(playlistId),
            Video.findByPk(videoId)
        ]);

        if (!playlist || !video) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        await playlist.removePlaylistVideo(video);

        ctx.body = { success: true };
    },

    async getPlaylistVideos(ctx) {
        const playlistId = ctx.params.id;
        const playlist = await Playlist.findByPk(playlistId);

        if (!playlist) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        let { page, perPage, order, sortBy } = ctx.query;
        page = page ?? 1;
        perPage = +(perPage ?? VIDEO_PER_PAGE);
        order = SORTING_ORDERS.includes(order) ? order : SORTING_ORDER.DESC;
        sortBy = PLAYLISTS_SORT_BY.includes(sortBy) ? sortBy : 'createdAt';

        const offset = (page - 1) * perPage;

        const [count, rows] = await Promise.all([
            playlist.countPlaylistVideos(),
            playlist.getPlaylistVideos({
                limit: perPage,
                offset,
                include: ['media'],
                order: [[sortBy, order]],
            }),
        ]);

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
    }
}
