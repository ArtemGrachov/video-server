'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      Playlist.belongsTo(
        models.User,
        {
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
  }
  Playlist.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    authorId: DataTypes.NUMBER,
  }, {
    sequelize,
    modelName: 'Playlist',
  });
  return Playlist;
};