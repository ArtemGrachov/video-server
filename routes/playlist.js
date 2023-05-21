const KoaRouter = require('koa-router');
const playlistController = require('../controllers/playlists');
const authMiddleware = require('../middlewares/auth');

const playlistRouter = new KoaRouter();

playlistRouter.post('/', authMiddleware, playlistController.createPlaylist);
playlistRouter.get('/:id', authMiddleware, playlistController.getPlaylist);

module.exports = playlistRouter;
