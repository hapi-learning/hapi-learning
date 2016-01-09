'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Tag', {
        name: {
            type: DataTypes.STRING(30),
            unique: true,
            allowNull: false,
            field: 'name'
        }
    }, {
        paranoid: true,
        tableName: 'tags',
        underscored: true
    });
};
