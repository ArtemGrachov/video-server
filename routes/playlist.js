const KoaRouter = require('koa-router');
const playlistController = require('../controllers/playlists');
const authMiddleware = require('../middlewares/auth');
const playlistAuthorMiddleware = require('../middlewares/playlist-author');

const playlistRouter = new KoaRouter();

playlistRouter.post('/', authMiddleware, playlistController.createPlaylist);
playlistRouter.get('/', authMiddleware, playlistController.getPlaylists);
playlistRouter.get('/:id', authMiddleware, playlistController.getPlaylist);
playlistRouter.delete('/:id', authMiddleware, playlistAuthorMiddleware, playlistController.deletePlaylist);
playlistRouter.patch('/:id', authMiddleware, playlistAuthorMiddleware, playlistController.updatePlaylist);

module.exports = playlistRouter;
