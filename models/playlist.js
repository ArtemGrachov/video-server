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
                    as: 'playlists',
                    foreignKey: 'playlistId',
                },
            );
        }

        serialize() {
            const { id, name, description, author } = this;

            return {
                id,
                name,
                description,
                author: author.serialize()
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
        }
    );

    return Playlist;
};