const { Model } = require('sequelize');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasOne(models.Media, { sourceKey: 'avatarId' });
            User.hasMany(models.Video, { foreignKey: 'authorId' });
        }
    }

    User.init(
        {
            email: {
                type: DataTypes.STRING,
                unique: true
            },
            password: DataTypes.STRING,
            name: DataTypes.STRING,
            avatarId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'User',
        }
    );

    User.prototype.getAuthTokens = function () {
        const token = jwt.sign(
            { userId: this.id },
            process.env.JWT_KEY,
            { expiresIn: process.env.JWT_LIFE }
        );

        const refreshToken = jwt.sign(
            { userId: this.id },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: process.env.JWT_REFRESH_LIFE }
        );

        return { token, refreshToken };
    }

    User.prototype.getResetPasswordToken = function() {
        const resetPasswordToken = jwt.sign(
            { userId: this.id },
            process.env.RESET_PASSWORD_TOKEN,
            { expiresIn: process.env.RESET_PASSWORD_TOKEN_LIFE }
        );
    
        return resetPasswordToken;
    }

    return User;
};
