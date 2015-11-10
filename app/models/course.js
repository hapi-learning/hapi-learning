'use strict';


module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Course', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            code: 'name'
        },
        code: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            field: 'code'
        },
        description: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
            field: 'description'
        }
    }, {
        paranoid: true,
        tableName: 'courses',
        underscored: true
    });
};
