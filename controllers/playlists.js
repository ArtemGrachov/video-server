const { Op } = require('sequelize');
const ERRORS = require('../constants/errors');
const { PLAYLISTS_PER_PAGE } = require('../constants/playlists');
const { VALIDATION_RULES } = require('../constants/validation');

const database = require('../models');

const { errorFactory } = require('../utils/error-factory');

const { Playlist, User } = database.sequelize.models;

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
}
