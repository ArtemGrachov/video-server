const ERRORS = require('../constants/errors');
const { VALIDATION_RULES } = require('../constants/validation');

const database = require('../models');

const { errorFactory } = require('../utils/error-factory');

const { Video } = database.sequelize.models;

module.exports = {
    async createVideo(ctx) {
        const { body } = ctx.request;
        const name = body.name ?? '';
        const description = body.description ?? '';

        const validation = { name: [], description: [] };

        if (!name.trim()) {
            validation.name.push({ rule: VALIDATION_RULES.REQUIRED });
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, validation);
        }

        // @todo upload video
        const video = await Video.create({
            name,
            description,
            authorId: ctx.user.id
        });

        ctx.body = video.serialize();
    }
};
