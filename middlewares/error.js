const ERRORS = require('../constants/errors');

const errorMiddleware = (ctx, next) => {
    return next().catch(error => {
        console.log(error);
        ctx.status = error?.status ?? 500;
        ctx.body = error?.data ?? { message: ERRORS.SERVER_ERROR };
    });
}

module.exports = errorMiddleware;
