/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('Videos', {
            name: 'FULLTEXT',
            fields: ['name', 'description']
        });
        await queryInterface.addIndex('Users', {
            name: 'FULLTEXT',
            fields: ['name']
        });
        await queryInterface.addIndex('Playlists', {
            name: 'FULLTEXT',
            fields: ['name', 'description']
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('Videos', 'FULLTEXT');
        await queryInterface.removeIndex('Users', 'FULLTEXT');
        await queryInterface.removeIndex('Playlists', 'FULLTEXT');
    },
};
