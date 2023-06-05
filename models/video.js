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
            Video.belongsToMany(
                models.User,
                {
                    through: 'VideoLikes',
                    as: 'likes',
                    foreignKey: 'videoId',
                },
            );
        }

        async serialize(user) {
            const { id, name, description, authorId, author, media, createdAt } = this;

            const [isLiked, likesCount] = await Promise.all([
                (user ? this.hasLike(user) : false),
                this.countLikes(),
            ]);

            return {
                id,
                name,
                description,
                authorId,
                author: await author?.serialize(user),
                media: await media?.serialize(user),
                createdAt,
                isLiked,
                likesCount,
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
            },
            indexes: [{
                name: 'FULLTEXT',
                fields: ['name', 'description']
            }],
        }
    );

    return Video;
};