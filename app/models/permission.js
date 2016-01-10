'use strict';

module.exports = function (sequelize, DataTypes) {

    return sequelize.define('Permission', {
        type: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
            field: 'type'
        },
        description: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false,
            field: 'description'
        }
    }, {
        paranoid: true,
        tableName: 'permissions',
        underscored: true
    });
};
