const database = require('../models');

const { errorFactory } = require('../utils/error-factory');

const ERRORS = require('../constants/errors');

const { Video } = database.sequelize.models;

const videoAuthor = async (ctx, next) => {
    const videoId = ctx.params.id;

    const video = await Video.findByPk(
        videoId,
        { include: 'author' }
    );

    if (!video) {
        throw errorFactory(404, ERRORS.NOT_FOUND);
    }

    if (video.author.id !== ctx.user?.id) {
        throw errorFactory(403, ERRORS.NOT_ALLOWED);
    }

    return next();
};

module.exports = videoAuthor;
