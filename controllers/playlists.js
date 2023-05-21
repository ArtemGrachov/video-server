const { Op } = require('sequelize');
const ERRORS = require('../constants/errors');
const { PLAYLISTS_PER_PAGE } = require('../constants/playlists');
const { VALIDATION_RULES } = require('../constants/validation');

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
            throw errorFactory(400, ERRORS.VALIDATION, validation);
        }

        const playlist = await Playlist.create({
            name,
            description,
            authorId: ctx.user.id
        });

        ctx.body = playlist.serialize();
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

        ctx.body = playlist.serialize();
    },

    async getPlaylists(ctx) {
        let { page, perPage, authorId } = ctx.query;
        page = page ?? 1;
        perPage = perPage ?? PLAYLISTS_PER_PAGE;

        const limit = page * perPage;
        const offset = (page - 1) * perPage;
        const where = {};

        if (authorId != null) {
            where.authorId = {
                [Op.eq]: authorId
            };
        }

        const { count, rows } = await Playlist.findAndCountAll({
            where,
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: 'author',
                    include: 'avatar'
                }
            ]
        });

        ctx.body = {
            pagination: {
                page,
                perPage,
                total: count,
            },
            data: rows.map(p => p.serialize())
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
            throw errorFactory(400, ERRORS.VALIDATION, validation);
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

        const playlistUpdated = await Playlist.findByPk(
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

        ctx.body = playlistUpdated.serialize();
    },

    async addVideosToPlaylist(ctx) {
        const { body } = ctx.request;
        const videoIds = body?.videoIds ?? [];

        const validation = { videoIds: [] };

        if (!videoIds.length) {
            validation.videoIds.push({ rule: VALIDATION_RULES.MIN_LENGTH, minLength: 1 });
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, validation);
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

        ctx.body = { test: true };
    }
}
