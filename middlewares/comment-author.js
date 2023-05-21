const database = require('../models');

const { errorFactory } = require('../utils/error-factory');

const ERRORS = require('../constants/errors');

const { Comment } = database.sequelize.models;

const commentAuthorMiddleware = async (ctx, next) => {
    const commentId = ctx.params.id;

    const comment = await Comment.findByPk(
        commentId,
        { include: 'author' }
    );

    if (!comment) {
        throw errorFactory(404, ERRORS.NOT_FOUND);
    }

    if (comment.author.id !== ctx.user?.id) {
        throw errorFactory(403, ERRORS.NOT_ALLOWED);
    }

    return next();
};

module.exports = commentAuthorMiddleware;
