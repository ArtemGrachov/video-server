const KoaRouter = require('koa-router');
const authController = require('../controllers/auth');

const authRouter = new KoaRouter();

authRouter.post('/registration', authController.registration);

module.exports = authRouter;
