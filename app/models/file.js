'use strict';


module.exports = function(sequelize, DataTypes) {
    return sequelize.define('File', {
        name: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false,
            field: 'name'
        },
        directory: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true, // If root folder == null
            field: 'directory',
        },
        ext: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
            field: 'ext'
        },
        type: {
            type: DataTypes.ENUM('f', 'd'),
            unique: false,
            allowNull: false,
            field: 'type'
        },
        hidden: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            field: 'hidden'
        },
        size: {
            type: DataTypes.BIGINT,
            unique: false,
            allowNull: false,
            field: 'size'
        }
    }, {
        tableName: 'files',
        underscored: true
    });
};
