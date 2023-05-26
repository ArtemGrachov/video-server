const Koa = require('koa');
const KoaRouter = require('koa-router');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const database = require('./models');
const cloud = require('./cloud');

const authRouter = require('./routes/auth');
const videoRouter = require('./routes/video');
const playlistRouter = require('./routes/playlist');
const commentRouter = require('./routes/comment');
const userRouter = require('./routes/user');
const userMiddleware = require('./middlewares/user');
const errorMiddleware = require('./middlewares/error');

const app = new Koa();
const router = new KoaRouter();

router.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.resolve(__dirname, 'uploads')
    }
}));
router.use(userMiddleware);
router.use(errorMiddleware);

router.use('/auth', authRouter.routes());
router.use('/video', videoRouter.routes());
router.use('/playlists', playlistRouter.routes());
router.use('/comments', commentRouter.routes());
router.use('/users', userRouter.routes());

router.get('/', (ctx, next) => {
    ctx.body = 'App works!';
});

app
    .use(cors())
    .use(router.routes())
    .use(router.allowedMethods());

const port = process.env.PORT ?? 3000;

app.listen(port);

console.log(`Server is running at http://localhost:${port}/`);
