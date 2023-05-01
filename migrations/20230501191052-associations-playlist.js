'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Playlists',
      'authorId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
          as: 'authorId'
        }
      }
    );
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn('Playlists', 'authorId');
  }
};
