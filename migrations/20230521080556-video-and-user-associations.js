/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Videos', 'mediaId');
        await queryInterface.removeColumn('Users', 'avatarId');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'Videos',
            'mediaId',
            {
                type: Sequelize.INTEGER
            }
        );
        await queryInterface.addColumn(
            'Users',
            'avatarId',
            {
                type: Sequelize.INTEGER
            }
        );
    }
};
