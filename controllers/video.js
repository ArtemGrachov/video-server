const ERRORS = require('../constants/errors');
const { VALIDATION_RULES } = require('../constants/validation');

const database = require('../models');

const { errorFactory } = require('../utils/error-factory');
const { upload, removeLocalFile } = require('../utils/upload');

const { Video, Media } = database.sequelize.models;

module.exports = {
    async createVideo(ctx) {
        const { body, files } = ctx.request;
        const name = body.name ?? '';
        const description = body.description ?? '';
        const fileVideo = files.video ?? null;

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
                authorId: ctx.user.id,
                media: {
                    externalId: cloudVideo.public_id
                }
            },
            {
                include: [{
                    association: Video.associations.media,
                    as: 'media'
                }]
            }
        );

        ctx.body = video.serialize();
    },

    async getVideo(ctx) {
        const videoId = ctx.params.id;

        const video = await Video.findByPk(videoId, { include: 'media' });

        if (!video) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        ctx.body = await video.serialize();
    }
};
