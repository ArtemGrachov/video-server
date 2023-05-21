const KoaRouter = require('koa-router');
const playlistController = require('../controllers/playlists');
const authMiddleware = require('../middlewares/auth');

const playlistRouter = new KoaRouter();

playlistRouter.post('/', authMiddleware, playlistController.createPlaylist);

module.exports = playlistRouter;
