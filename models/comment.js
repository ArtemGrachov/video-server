const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        static associate(models) {
            Comment.belongsTo(
                models.Video,
                {
                    as: 'video',
                    foreignKey: 'referenceId',
                    onDelete: 'CASCADE',
                },
            );
            Comment.hasMany(
                models.Like,
                {
                    foreignKey: 'referenceId',
                    constraints: false,
                    scope: {
                        referenceType: 'comment',
                    },
                },
            );
        }

        serialize() {
            const { id, content } = this;

            return {
                id,
                content
            };
        }
    }

    Comment.init(
        {
            content: DataTypes.STRING,
            referenceId: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'Comment',
        }
    );
    return Comment;
};