require('dotenv').config();

const defaultConfig = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: process.env.DB_PORT ?? 3306,
    dialect: 'mysql',
};

module.exports = {
    development: defaultConfig,
    test: defaultConfig,
    production: defaultConfig,
};
