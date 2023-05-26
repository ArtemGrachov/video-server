const KoaRouter = require('koa-router');
const userController = require('../controllers/users');
const authMiddleware = require('../middlewares/auth');

const userRouter = new KoaRouter();

userRouter.patch('/self', authMiddleware, userController.updateUser);
userRouter.get('/:userId', userController.getUser);
userRouter.post('/:userId/subscription', authMiddleware, userController.subscribe);

module.exports = userRouter;
