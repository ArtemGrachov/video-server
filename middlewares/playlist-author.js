const database = require('../models');

const { errorFactory } = require('../utils/error-factory');

const ERRORS = require('../constants/errors');

const { Playlist } = database.sequelize.models;

const playlistAuthorMiddleware = async (ctx, next) => {
    const playlistId = ctx.params.id;

    const playlist = await Playlist.findByPk(
        playlistId,
        { include: 'author' }
    );

    if (!playlist) {
        throw errorFactory(404, ERRORS.NOT_FOUND);
    }

    if (playlist.author.id !== ctx.user?.id) {
        throw errorFactory(403, ERRORS.NOT_ALLOWED);
    }

    return next();
};

module.exports = playlistAuthorMiddleware;
