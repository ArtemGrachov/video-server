'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Comment.belongsTo(
        models.Video,
        {
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
  }
  Comment.init({
    content: DataTypes.STRING,
    referenceId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};