const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Subscription extends Model {
        static associate(models) {
            Subscription
                .belongsTo(
                    models.User,
                    {
                        as: 'subscriber',
                        foreignKey: 'subscriptionId',
                        onDelete: 'CASCADE',
                    },
                );
            Subscription
                .belongsTo(
                    models.User,
                    {
                        as: 'subscription',
                        foreignKey: 'subscriptionId',
                        onDelete: 'CASCADE',
                    },
                );
        }
    }
    Subscription.init(
        {
            subscriberId: DataTypes.INTEGER,
            subscriptionId: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'Subscription',
        }
    );

    return Subscription;
};