'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('PasswordResetRequest', {
        guid: {
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
        }
    },  {
        paranoid: true,
        tableName: 'password_reset_requests',
        underscored: true
    });
};
