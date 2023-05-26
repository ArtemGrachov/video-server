const ERRORS = require('../constants/errors');
const { MEDIA_TYPES } = require('../constants/media');
const { VALIDATION_RULES } = require('../constants/validation');
const { errorFactory } = require('../utils/error-factory');
const { upload, removeLocalFile } = require('../utils/upload');

const database = require('../models');

const { User } = database.sequelize.models;

module.exports = {
    async updateUser(ctx) {
        const user = ctx.user;
        const { body, files } = ctx.request;
        const name = body?.name;
        const email = body?.email;
        const fileAvatar = files?.avatar ?? null;

        const validation = { name: [], email: [] };

        if (name != null && !name.trim()) {
            validation.name.push({ rule: VALIDATION_RULES.REQUIRED });
        }

        if (email != null) {
            if (!email.trim()) {
                validation.email.push({ rule: VALIDATION_RULES.REQUIRED });
            } else if (!isEmail(email)) {
                validation.email.push({ rule: VALIDATION_RULES.NOT_EMAIL });
            }
        }

        if (Object.keys(validation).some(k => validation[k].length)) {
            throw errorFactory(400, ERRORS.VALIDATION, validation);
        }

        if (fileAvatar != null) {
            const cloudVideo = await upload(fileAvatar.newFilename, 'image');

            removeLocalFile(fileAvatar.newFilename);

            const oldMedia = await user.getAvatar();

            if (oldMedia) {
                await oldMedia.destroy();
            }

            await user.createAvatar({
                externalId: cloudVideo.public_id,
                type: MEDIA_TYPES.IMAGE,
            });
        }

        if (name != null) {
            user.name = name;
        }

        if (email != null) {
            user.emai = email;
        }

        await user.save();

        const updatedUser = await User.findByPk(user.id, { include: 'avatar' });

        ctx.body = await updatedUser.serialize(ctx.user);
    },

    async getUser(ctx) {
        const { userId } = ctx.params;

        const user = await User.findByPk(userId, { include: 'avatar' });

        if (!user) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        ctx.body = await user.serialize(ctx.user);
    },

    async subscribe(ctx) {
        const { userId } = ctx.params;

        if (userId === ctx.user?.id) {
            throw errorFactory(400, ERRORS.VALIDATION);
        }

        const user = await User.findByPk(userId, { include: 'avatar' });

        if (!user) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        await user.addSubscriber(ctx.user);

        ctx.body = { success: true };
    },

    async unsubscribe(ctx) {
        const { userId } = ctx.params;

        if (userId === ctx.user?.id) {
            throw errorFactory(400, ERRORS.VALIDATION);
        }

        const user = await User.findByPk(userId, { include: 'avatar' });

        if (!user) {
            throw errorFactory(404, ERRORS.NOT_FOUND);
        }

        await user.removeSubscriber(ctx.user);

        ctx.body = { success: true };
    }
}
