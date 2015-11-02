'use strict';

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('tag', {
		name: {
			type: DataTypes.TEXT,
			unique: true,
			allowNull: false,
			code: 'name'
		},
		{
			paranoid: true,
			tableName: 'tag',
			underscored: true
		}
	});
}
