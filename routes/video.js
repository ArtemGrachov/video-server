const KoaRouter = require('koa-router');
const videoController = require('../controllers/video');
const authMiddleware = require('../middlewares/auth');

const videoRouter = new KoaRouter();

videoRouter.post('/', authMiddleware, videoController.createVideo);
videoRouter.get('/', videoController.getVideos);
videoRouter.get('/:id', videoController.getVideo);

module.exports = videoRouter;
