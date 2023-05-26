const KoaRouter = require('koa-router');
const commentsController = require('../controllers/comments');
const authMiddleware = require('../middlewares/auth');
const commentAuthorMiddleware = require('../middlewares/comment-author');

const commentRouter = new KoaRouter();

commentRouter.delete('/:id', authMiddleware, commentAuthorMiddleware, commentsController.deleteComment);
commentRouter.patch('/:id', authMiddleware, commentAuthorMiddleware, commentsController.updateComment);
commentRouter.post('/:id/like', authMiddleware, commentsController.likeComment);
commentRouter.delete('/:id/like', authMiddleware, commentsController.removeLikeComment);

module.exports = commentRouter;
