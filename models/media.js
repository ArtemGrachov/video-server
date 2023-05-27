const { Model } = require('sequelize');
const { MEDIA_REFERENCE_TYPES, MEDIA_TYPES } = require('../constants/media');
const cloudinary = require('cloudinary').v2;

module.exports = (sequelize, DataTypes) => {
    class Media extends Model {
        static associate(models) {
            Media.belongsTo(
                models.Video,
                {
                    foreignKey: 'referenceId',
                    constraints: false,
                    as: 'media',
                    onDelete: 'CASCADE'
                }
            );
            Media.belongsTo(
                models.User,
                {
                    foreignKey: 'referenceId',
                    constraints: false,
                    as: 'avatar',
                    onDelete: 'CASCADE'
                }
            );
        }

        serialize() {
            const { id, externalId } = this;
            let url = null;
            let thumbnailUrl = null;

            switch (this.type) {
                case MEDIA_TYPES.VIDEO: {
                    url = cloudinary.utils.video_url(externalId);
                    thumbnailUrl = cloudinary.utils.video_thumbnail_url(externalId);
                    break;
                }
                case MEDIA_TYPES.IMAGE: {
                    url = cloudinary.utils.url(externalId);
                    break;
                }
            }

            return { id, url, thumbnailUrl };
        }
    }

    Media.init(
        {
            externalId: DataTypes.STRING,
            referenceId: DataTypes.INTEGER,
            referenceType: DataTypes.STRING,
            type: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'Media',
            hooks: {
                async afterDestroy(media) {
                    const { externalId, type } = media;

                    await cloudinary.uploader.destroy(externalId, { resource_type: type });
                }
            }
        }
    );

    return Media;
};
