const Koa = require('koa');
const KoaRouter = require('koa-router');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const dotenv = require('dotenv');

dotenv.config();

const database = require('./models');

const authRouter = require('./routes/auth');
const videoRouter = require('./routes/video');
const errorMiddleware = require('./middlewares/error');

const app = new Koa();
const router = new KoaRouter();

router.use(koaBody());
router.use(errorMiddleware);

router.use('/auth', authRouter.routes());
router.use('/video', videoRouter.routes());

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
