const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VideoLikes extends Model {
        static associate(models) {
            VideoLikes
                .belongsTo(
                    models.Video,
                    {
                        as: 'video',
                        foreignKey: 'videoId',
                        onDelete: 'CASCADE',
                    },
                );
            VideoLikes
                .belongsTo(
                    models.User,
                    {
                        as: 'user',
                        foreignKey: 'userId',
                        onDelete: 'CASCADE',
                    },
                );
        }
    }

    VideoLikes.init(
        {
            videoId: DataTypes.INTEGER,
            userId: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'VideoLikes',
        }
    );

    return VideoLikes;
};
