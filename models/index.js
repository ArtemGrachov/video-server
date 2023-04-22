'use strict';

const Sequelize = require('sequelize');
const config = require('../config/database');

const User = require('./user');

const db = {};

const environment = process.env.NODE_ENV ?? 'development';

const sequelize = new Sequelize(
  config[environment].database,
  config[environment].username,
  config[environment].password,
  {
    dialect: 'mysql',
    host: config[environment].host,
    port: config[environment].port,
  },
);

const models = [User];

models.forEach(m => {
  const model = m(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
