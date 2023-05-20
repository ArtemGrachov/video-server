const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Media extends Model { }

    Media.init(
        {
            externalId: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'Media',
        }
    );

    return Media;
};
