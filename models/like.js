const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Like extends Model {
        static associate(models) {
            Like
                .belongsTo(
                    models.User,
                    {
                        foreignKey: 'authorId',
                        onDelete: 'CASCADE',
                    },
                );
            Like
                .belongsTo(
                    models.Video,
                    {
                        foreignKey: 'referenceId',
                        constraints: false,
                        onDelete: 'CASCADE'
                    }
                );
            Like
                .belongsTo(
                    models.Comment,
                    {
                        foreignKey: 'referenceId',
                        onDelete: 'CASCADE',
                        constraints: false,
                    },
                );
        }
    }

    Like.init(
        {
            referenceId: DataTypes.INTEGER,
            referenceType: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'Like',
        }
    );
    return Like;
};
