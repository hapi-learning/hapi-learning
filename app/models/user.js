'use strict';

const Bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {
        username: {
            type: DataTypes.STRING(30),
            unique: true,
            allowNull: false,
            field: 'username'
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'password',
            set: function(val) {
                this.setDataValue('password', Bcrypt.hashSync(val, Bcrypt.genSaltSync()));
            }
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            field: 'email'
        },
        firstName: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
            field: 'first_name'
        },
        lastName: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
            field: 'last_name'
        },
        phoneNumber: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
            field: 'phone_number'
        },
        notify: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            field: 'notify',
            defaultValue: false
        }
    }, {
        underscored: true,
        paranoid: true,
        tableName: 'users'
    });
};
