/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.removeColumn('Videos', 'mediaId');
        queryInterface.removeColumn('Users', 'avatarId');
    },

    async down(queryInterface, Sequelize) {
        queryInterface.addColumn(
            'Videos',
            'mediaId',
            {
                type: Sequelize.INTEGER
            }
        );
        queryInterface.addColumn(
            'Users',
            'avatarId',
            {
                type: Sequelize.INTEGER
            }
        );
    }
};
