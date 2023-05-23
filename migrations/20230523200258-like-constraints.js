/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint('Likes', {
            fields: ['referenceId', 'referenceType', 'authorId'],
            type: 'unique',
            name: 'like_unique_constraint_author_reference'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('Likes', 'like_unique_constraint_author_reference');
    }
};
