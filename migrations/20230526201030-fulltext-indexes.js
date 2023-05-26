/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('Videos', {
            name: 'videos_fulltext_search',
            type: 'FULLTEXT',
            fields: ['name', 'description']
        });
        await queryInterface.addIndex('Users', {
            name: 'users_fulltext_search',
            type: 'FULLTEXT',
            fields: ['name']
        });
        await queryInterface.addIndex('Playlists', {
            name: 'playlists_fulltext_search',
            type: 'FULLTEXT',
            fields: ['name', 'description']
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('Videos', 'videos_fulltext_search');
        await queryInterface.removeIndex('Users', 'users_fulltext_search');
        await queryInterface.removeIndex('Playlists', 'playlists_fulltext_search');
    },
};
