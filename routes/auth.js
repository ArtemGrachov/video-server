const KoaRouter = require('koa-router');
const authController = require('../controllers/auth');

const authRouter = new KoaRouter();

authRouter.post('/registration', authController.registration);
authRouter.post('/log-in', authController.logIn);

module.exports = authRouter;
