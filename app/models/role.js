'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Role', {
        name: {
            type: DataTypes.STRING(30),
            unique: true,
            allowNull: false,
            field: 'name',
            validate: {
                isAlpha: true
            }
        }
    }, {
        paranoid: true,
        tableName: 'roles',
        underscored: true
    });
};
