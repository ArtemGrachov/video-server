const jwt = require('jsonwebtoken');
const database = require('../models');

const { errorFactory } = require('../utils/error-factory');

const ERRORS = require('../constants/errors');

const { User } = database.sequelize.models;

const authMiddleware = async (ctx, next) => {
    const authHeader = ctx.get('Authorization');

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        let decodedToken;

        try {
            decodedToken = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            throw errorFactory(401, ERRORS.NOT_AUTHENTICATED);
        };

        if (!decodedToken) {
            throw errorFactory(401, ERRORS.NOT_AUTHENTICATED);
        }

        const user = await User.findByPk(decodedToken.userId);

        if (!user) {
            throw errorFactory(401, ERRORS.NOT_AUTHENTICATED);
        }

        ctx.user = user;
        return next();
    }

    throw errorFactory(401, ERRORS.NOT_AUTHENTICATED);
};

module.exports = authMiddleware;
