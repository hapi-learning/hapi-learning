'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('News', {
        subject: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false,
            code: 'subject'
        },
        content: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: false,
            field: 'content'
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            unique: false,
            allowNull: false,
            field: 'date'
        }
    },  {
        paranoid: true,
        tableName: 'news',
        underscored: true
    });
};
