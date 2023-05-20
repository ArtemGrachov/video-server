/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.removeColumn('Videos', 'videoId');
        queryInterface.addColumn(
            'Videos',
            'mediaId',
            {
                type: Sequelize.INTEGER
            }
        );

        queryInterface.addColumn(
            'Media',
            'referenceId',
            {
                type: Sequelize.INTEGER,
            }
        );
        queryInterface.addColumn(
            'Media',
            'referenceType',
            {
                type: Sequelize.STRING
            }
        );
    },
    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('Videos', 'mediaId');
        queryInterface.addColumn(
            'Videos',
            'videoId',
            {
                type: Sequelize.INTEGER,
            }
        );

        queryInterface.removeColumn('Media', 'referenceId');
        queryInterface.removeColumn('Media', 'referenceType');
        queryInterface.removeColumn('Users', 'mediaId');
    }
};
