'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Video.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    authorId: DataTypes.NUMBER,
    videoId: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Video',
  });
  Video.associate = (models) => {
    Video.hasOne(models.Media, { sourceKey: 'videoId' });
    Video.belongsTo(
      models.User,
      {
        foreignKey: 'authorId',
        onDelete: 'CASCADE'
      }
    );
  }
  return Video;
};