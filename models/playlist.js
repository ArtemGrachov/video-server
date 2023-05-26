const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Playlist extends Model {
        static associate(models) {
            Playlist.belongsTo(
                models.User,
                {
                    as: 'author',
                    foreignKey: 'authorId',
                    onDelete: 'CASCADE',
                },
            );
            Playlist.belongsToMany(
                models.Video,
                {
                    through: 'PlaylistVideos',
                    as: 'playlistVideos',
                    foreignKey: 'playlistId',
                },
            );
        }

        async serialize(user) {
            const { id, name, description, authorId, author } = this;

            return {
                id,
                name,
                description,
                authorId,
                author: await author?.serialize(),
            };
        }
    }

    Playlist.init(
        {
            name: DataTypes.STRING,
            description: DataTypes.STRING,
            authorId: DataTypes.NUMBER,
        },
        {
            sequelize,
            modelName: 'Playlist',
            indexes: [{
                name: 'FULLTEXT',
                fields: ['name', 'description']
            }],
        }
    );

    return Playlist;
};