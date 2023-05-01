'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.changeColumn(
      'PlaylistVideos',
      'playlistId',
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Playlists',
          key: 'id',
          as: 'playlistId'
        }
      }
    );
    queryInterface.changeColumn(
      'PlaylistVideos',
      'videoId',
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Videos',
          key: 'id',
          as: 'videoId'
        }
      }
    );
  },

  async down (queryInterface, Sequelize) {
    queryInterface.changeColumn(
      'PlaylistVideos',
      'playlistId',
      {
        onDelete: 'NO ACTION',
        references: null
      }
    );
    queryInterface.changeColumn(
      'PlaylistVideos',
      'videoId',
      {
        onDelete: 'NO ACTION',
        references: null
      }
    );
  }
};
