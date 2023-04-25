'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    avatarId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'User',
  });
  User.associate = (models) => {
    User.hasOne(models.Media, { sourceKey: 'avatarId' });
  }
  return User;
};