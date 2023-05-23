/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'Users',
            'email',
            {
                type: Sequelize.STRING,
                unique: true
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'Users',
            'email',
            {
                type: Sequelize.STRING,
                unique: false
            }
        );
    }
};
