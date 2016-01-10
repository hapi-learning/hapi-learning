'use strict';

//const Bcrypt = require('bcrypt-nodejs');

module.exports = function (sequelize, DataTypes) {

    return sequelize.define('PasswordResetRequest', {
        uuid: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            field: 'guid'
        },
        time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            unique: false,
            allowNull: false,
            field: 'time'
        },
        disabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            unique: false,
            allowNull: false,
            field: 'disabled'
        }
    },  {
        paranoid: true,
        tableName: 'password_reset_requests',
        underscored: true
    });
};
