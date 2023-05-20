const KoaRouter = require('koa-router');
const videoController = require('../controllers/video');
const authMiddleware = require('../middlewares/auth');

const videoRouter = new KoaRouter();

videoRouter.post('/', authMiddleware, videoController.createVideo);

module.exports = videoRouter;
