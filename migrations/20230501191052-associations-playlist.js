'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
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
    await queryInterface.removeColumn('Playlists', 'authorId');
  }
};
