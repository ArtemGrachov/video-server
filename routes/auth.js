const KoaRouter = require('koa-router');
const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

const authRouter = new KoaRouter();

authRouter.post('/registration', authController.registration);
authRouter.post('/log-in', authController.logIn);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/reset-password-request', authController.generatePasswordResetToken);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.post('/change-password', authMiddleware, authController.changePassword);

module.exports = authRouter;
