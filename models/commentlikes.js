const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CommentLikes extends Model {
        static associate(models) {
            CommentLikes
                .belongsTo(
                    models.Comment,
                    {
                        as: 'comment',
                        foreignKey: 'commentId',
                        onDelete: 'CASCADE',
                    },
                );
                CommentLikes
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
    CommentLikes.init(
        {
            commentId: DataTypes.INTEGER,
            userId: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'CommentLikes',
        }
    );
    return CommentLikes;
};
