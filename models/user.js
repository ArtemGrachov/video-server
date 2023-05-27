const { Model } = require('sequelize');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasOne(
                models.Media,
                {
                    as: 'avatar',
                    foreignKey: 'referenceId',
                    scope: {
                        referenceType: 'user'
                    }
                }
            );
            User.hasMany(models.Video, { foreignKey: 'authorId' });
            User.belongsToMany(
                models.Video,
                {
                    through: 'VideoLikes',
                    as: 'videoLikes',
                    foreignKey: 'userId',
                },
            );
            User.belongsToMany(
                models.Comment,
                {
                    through: 'CommentLikes',
                    as: 'commentLikes',
                    foreignKey: 'userId',
                },
            );
            User.belongsToMany(
                models.User,
                {
                    through: 'Subscriptions',
                    as: 'subscriber',
                    foreignKey: 'subscriptionId',
                }
            );
            User.belongsToMany(
                models.User,
                {
                    through: 'Subscriptions',
                    as: 'subscription',
                    foreignKey: 'subscriberId',
                }
            );
        }

        getAuthTokens() {
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

        getResetPasswordToken() {
            const resetPasswordToken = jwt.sign(
                { userId: this.id },
                process.env.RESET_PASSWORD_TOKEN,
                { expiresIn: process.env.RESET_PASSWORD_TOKEN_LIFE }
            );

            return resetPasswordToken;
        }

        async serialize(user) {
            const { id, name, avatar, email } = this;

            const isSubscription = user ? await this.hasSubscriber(user) : false;

            return {
                id,
                name,
                avatar,
                email: user.id === id ? email : undefined,
                isSubscription,
            };
        }

        serializeMin(user) {
            const { id, name, avatar } = this;

            return {
                id,
                name,
                avatar: avatar?.serialize()
            };
        }
    }

    User.init(
        {
            email: {
                type: DataTypes.STRING,
                unique: true
            },
            password: DataTypes.STRING,
            name: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'User',
            indexes: [{
                name: 'FULLTEXT',
                fields: ['name']
            }],
        }
    );

    return User;
};
