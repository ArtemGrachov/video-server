/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('Likes', 'like_unique_constraint_author_reference');
        await queryInterface.dropTable('Likes');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.createTable('Likes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            referenceId: {
                type: Sequelize.INTEGER
            },
            referenceType: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
        await queryInterface.addConstraint('Likes', {
            fields: ['referenceId', 'referenceType', 'authorId'],
            type: 'unique',
            name: 'like_unique_constraint_author_reference'
        });
    }
};
