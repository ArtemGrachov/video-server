'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.changeColumn(
      'Comments',
      'referenceId',
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Videos',
          key: 'id',
          as: 'referenceId'
        }
      }
    );
  },

  async down (queryInterface, Sequelize) {
    queryInterface.changeColumn(
      'Comments',
      'referenceId',
      {
        references: null
      }
    );
  }
};
