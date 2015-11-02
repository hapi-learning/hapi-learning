'use strict';

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Role', {
		name: {
			type: DataTypes.TEXT,
			unique: true,
			allowNull: false,
			field: 'name'
		}
	}, {
		paranoid: true,
		tableName: 'roles',
		underscored: true
	});
};
