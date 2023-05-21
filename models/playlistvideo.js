const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PlaylistVideo extends Model {
        static associate(models) {
            PlaylistVideo
                .belongsTo(
                    models.Video,
                    {
                        as: 'video',
                        foreignKey: 'videoId',
                        onDelete: 'CASCADE',
                    },
                );
            PlaylistVideo
                .belongsTo(
                    models.Playlist,
                    {
                        as: 'playlist',
                        foreignKey: 'playlistId',
                        onDelete: 'CASCADE',
                    },
                );
        }
    }

    PlaylistVideo.init(
        {
            videoId: DataTypes.INTEGER,
            playlistId: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'PlaylistVideo',
        }
    );

    return PlaylistVideo;
};