'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Users',
      'avatarId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Media',
          key: 'id',
          as: 'avatarId'
        }
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'avatarId');
  }
};
