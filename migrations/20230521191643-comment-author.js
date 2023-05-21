/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn(
            'Comments',
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

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('Comments', 'authorId');
    }
};
