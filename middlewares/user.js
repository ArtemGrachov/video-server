const jwt = require('jsonwebtoken');
const database = require('../models');

const { errorFactory } = require('../utils/error-factory');

const ERRORS = require('../constants/errors');

const { User } = database.sequelize.models;

const userMiddleware = async (ctx, next) => {
    const authHeader = ctx.get('Authorization');

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        let decodedToken;

        try {
            decodedToken = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            throw errorFactory(401, ERRORS.NOT_AUTHENTICATED);
        };

        const user = await User.findByPk(decodedToken.userId);

        if (user) {
            ctx.user = user;
        }
    }

    return next();
};

module.exports = userMiddleware;
