const jwt = require('jsonwebtoken');
const database = require('../models');

const { errorFactory } = require('../utils/error-factory');

const ERRORS = require('../constants/errors');

const authMiddleware = async (ctx, next) => {
    if (!ctx.user) {
        throw errorFactory(401, ERRORS.NOT_AUTHENTICATED);
    }

    return next();
};

module.exports = authMiddleware;
