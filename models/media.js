const { Model } = require('sequelize');
const { MEDIA_REFERENCE_TYPES } = require('../constants/media');
const cloudinary = require('cloudinary').v2;

module.exports = (sequelize, DataTypes) => {
    class Media extends Model {
        static associate(models) {
            Media.belongsTo(
                models.Video,
                {
                    foreignKey: 'referenceId',
                    constraints: false,
                    as: 'media'
                }
            );
            Media.belongsTo(
                models.User,
                {
                    foreignKey: 'referenceId',
                    constraints: false,
                    as: 'avatar'
                }
            );
        }

        serialize() {
            const { id, externalId } = this;
            let url = null;
            let thumbnailUrl = null;

            switch (this.referenceType) {
                case MEDIA_REFERENCE_TYPES.VIDEO: {
                    url = cloudinary.utils.video_url(externalId);
                    thumbnailUrl = cloudinary.utils.video_thumbnail_url(externalId);
                    break;
                }
                case MEDIA_REFERENCE_TYPES.IMAGE: {
                    url = cloudinary.image(externalId);
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
            referenceType: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'Media',
        }
    );

    return Media;
};
