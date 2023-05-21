const KoaRouter = require('koa-router');
const videoController = require('../controllers/video');
const authMiddleware = require('../middlewares/auth');
const videoAuthorMiddleware = require('../middlewares/video-author');

const videoRouter = new KoaRouter();

videoRouter.post('/', authMiddleware, videoController.createVideo);
videoRouter.get('/', videoController.getVideos);
videoRouter.get('/:id', videoController.getVideo);
videoRouter.delete('/:id', authMiddleware, videoAuthorMiddleware, videoController.deleteVideo);
videoRouter.patch('/:id', authMiddleware, videoAuthorMiddleware, videoController.updateVideo);

module.exports = videoRouter;
