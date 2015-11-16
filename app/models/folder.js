'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Folder', {
        name: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false,
            field: 'name'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        }
    }, {
        paranoid: true,
        tableName: 'folders',
        underscored: true
    });
};
