const KoaRouter = require('koa-router');
const userController = require('../controllers/user');
const authMiddleware = require('../middlewares/auth');

const userRouter = new KoaRouter();

userRouter.patch('/self', authMiddleware, userController.updateUser);

module.exports = userRouter;
