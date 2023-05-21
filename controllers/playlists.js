const ERRORS = require('../constants/errors');
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
    }
}
