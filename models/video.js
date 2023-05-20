const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Video extends Model {
        static associate(models) {
            Video.hasOne(models.Media, { sourceKey: 'videoId' });
            Video.belongsTo(
                models.User,
                {
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
            const { id, name, description, authorId } = this;

            return {
                id,
                name,
                description,
                authorId,
            };
        }
    }

    Video.init(
        {
            name: DataTypes.STRING,
            description: DataTypes.STRING,
            authorId: DataTypes.NUMBER,
            videoId: DataTypes.NUMBER
        },
        {
            sequelize,
            modelName: 'Video',
        }
    );

    return Video;
};