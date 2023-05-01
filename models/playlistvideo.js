'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlaylistVideo extends Model {
    static associate(models) {
      PlaylistVideo
        .belongsTo(
          models.Video,
          {
            foreignKey: 'videoId',
          },
        );
      PlaylistVideo
        .belongsTo(
          models.Playlist,
          {
            foreignKey: 'playlistId',
          },
        );
    }
  }
  PlaylistVideo.init({
    videoId: DataTypes.INTEGER,
    playlistId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PlaylistVideo',
  });
  return PlaylistVideo;
};