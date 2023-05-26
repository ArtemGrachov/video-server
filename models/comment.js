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
            Comment.belongsTo(
                models.User,
                {
                    as: 'author',
                    foreignKey: 'authorId',
                    onDelete: 'CASCADE',
                },
            );
            Comment.belongsToMany(
                models.User,
                {
                    through: 'CommentLikes',
                    as: 'likes',
                    foreignKey: 'commentId',
                },
            );
        }

        serialize() {
            const { id, content, author } = this;

            return {
                id,
                content,
                author: author?.serialize()
            };
        }
    }

    Comment.init(
        {
            content: DataTypes.STRING,
            referenceId: DataTypes.INTEGER,
            authorId: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'Comment',
        }
    );
    return Comment;
};