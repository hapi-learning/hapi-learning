'use strict';

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
            field: 'password'
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
        }
    }, {
        underscored: true,
        paranoid: true,
        tableName: 'users'
    });
};
