'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'Videos',
      'authorId',
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'authorId'
        }
      }
    );
    await queryInterface.changeColumn(
      'Videos',
      'videoId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Media',
          key: 'id',
          as: 'videoId'
        }
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'Videos',
      'authorId',
      {
        references: null
      }
    );
    await queryInterface.changeColumn(
      'Videos',
      'videoId',
      {
        onDelete: 'NO ACTION',
        references: null
      }
    );
  }
};
