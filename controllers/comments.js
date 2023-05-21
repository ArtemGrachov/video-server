const ERRORS = require('../constants/errors');
const { VALIDATION_RULES } = require('../constants/validation');

const database = require('../models');

const { errorFactory } = require('../utils/error-factory');

const { Comment, User } = database.sequelize.models;

module.exports = {
    async deleteComment(ctx) {
        const commentId = ctx.params.id;

        const comment = await Comment.findByPk(commentId);

        await comment.destroy();

        ctx.body = { success: true };
    },

    async updateComment(ctx) {
        const { body } = ctx.request;

        const content = body?.content;

        const validation = { content: [] };

        if (content != null && !content.trim()) {
            validation.content.push({ rule: VALIDATION_RULES.REQUIRED });
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, validation);
        }

        const commentId = ctx.params.id;
        const comment = await Comment.findByPk(commentId);

        if (content != null) {
            comment.content = content;
        }

        await comment.save();

        const commentUpdated = await Comment.findByPk(
            commentId,
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

        ctx.body = commentUpdated.serialize();
    }
};
