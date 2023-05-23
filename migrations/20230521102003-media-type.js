/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'Media',
            'type',
            {
                type: Sequelize.STRING,
                allowNull: true
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Media', 'type');
    }
};
