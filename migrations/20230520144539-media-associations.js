/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Videos', 'videoId');
        await queryInterface.addColumn(
            'Videos',
            'mediaId',
            {
                type: Sequelize.INTEGER
            }
        );

        await queryInterface.addColumn(
            'Media',
            'referenceId',
            {
                type: Sequelize.INTEGER,
            }
        );
        await queryInterface.addColumn(
            'Media',
            'referenceType',
            {
                type: Sequelize.STRING
            }
        );
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Videos', 'mediaId');
        await queryInterface.addColumn(
            'Videos',
            'videoId',
            {
                type: Sequelize.INTEGER,
            }
        );

        await queryInterface.removeColumn('Media', 'referenceId');
        await queryInterface.removeColumn('Media', 'referenceType');
        await queryInterface.removeColumn('Users', 'mediaId');
    }
};
