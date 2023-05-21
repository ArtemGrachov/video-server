/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn(
            'Media',
            'type',
            {
                type: Sequelize.STRING,
                allowNull: true
            }
        );
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('Media', 'type');
    }
};
