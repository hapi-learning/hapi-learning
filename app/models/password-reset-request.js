'use strict';

const Bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('PasswordResetRequest', {
        guid: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            field: 'guid',
            set: function(value) {
                this.setDataValue('guid', Bcrypt.hashSync(value, Bcrypt.genSaltSync()));
            }
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
