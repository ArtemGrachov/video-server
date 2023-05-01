module.exports = {
    async registration(ctx) {
        try {
            ctx.body = { success: true };
        } catch (err) {
            ctx.throw(500);
        }
    }
}
