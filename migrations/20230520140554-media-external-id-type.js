/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'Media',
            'externalId',
            {
                type: Sequelize.STRING
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'Media',
            'externalId',
            {
                type: Sequelize.INTEGER
            }
        );
    }
};
