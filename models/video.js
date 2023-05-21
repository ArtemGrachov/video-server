const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Video extends Model {
        static associate(models) {
            Video.hasOne(
                models.Media,
                {
                    as: 'media',
                    foreignKey: 'referenceId',
                    scope: {
                        referenceType: 'video'
                    }
                }
            );
            Video.belongsTo(
                models.User,
                {
                    as: 'author',
                    foreignKey: 'authorId',
                    onDelete: 'CASCADE'
                }
            );
            Video.hasMany(
                models.Like,
                {
                    foreignKey: 'referenceId',
                    constraints: false,
                    scope: {
                        referenceType: 'video',
                    },
                },
            );
            Video.hasMany(
                models.Comment,
                {
                    foreignKey: 'referenceId',
                    as: 'comments'
                }
            );
            Video.belongsToMany(
                models.Playlist,
                {
                    through: 'PlaylistVideos',
                    as: 'videos',
                    foreignKey: 'videoId',
                },
            );
        }

        serialize() {
            const { id, name, description, author, media, createdAt } = this;

            return {
                id,
                name,
                description,
                author: author?.serialize(),
                media: media?.serialize(),
                createdAt
            };
        }
    }

    Video.init(
        {
            name: DataTypes.STRING,
            description: DataTypes.STRING,
            authorId: DataTypes.NUMBER
        },
        {
            sequelize,
            modelName: 'Video',
            hooks: {
                async afterDestroy(video) {
                    const media = await video.getMedia();
                    await media.destroy();
                }
            }
        }
    );

    return Video;
};