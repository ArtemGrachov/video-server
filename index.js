const Koa = require('koa');
const KoaRouter = require('koa-router');

const app = new Koa();
const router = new KoaRouter();

router.get('/', (ctx, next) => {
    ctx.body = 'App works!';
});

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(process.env.PORT ?? 3000);

