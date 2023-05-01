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
      Video.hasOne(models.Media, { sourceKey: 'videoId' });
      Video.belongsTo(
        models.User,
        {
          foreignKey: 'authorId',
          onDelete: 'CASCADE'
        }
      );
      Video.hasMany(
        models.Like,
        {
          foreignKey: 'referenceId',
          constraints: false,
          scope: {
            referenceType: 'video',
          },
        },
      );
      Video.belongsToMany(
        models.Playlist,
        {
          through: 'PlaylistVideos',
          as: 'videos',
          foreignKey: 'videoId',
        },
      );
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
  return Video;
};