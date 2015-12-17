'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('News', {
        subject: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false,
            field: 'subject'
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
        },
        priority: {
            type: DataTypes.ENUM,
            values : ['info', 'warning', 'danger'],
            defaultValue: 'info',
            unique: false,
            allowNull: false,
            field: 'priority'
        }
    },  {
        paranoid: true,
        tableName: 'news',
        underscored: true
    });
};
