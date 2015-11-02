'use strict';

exports.register = function (server, options, next) {

    const Controllers = server.plugins.controllers.controllers;
    const Models      = server.plugins.models.models;


    // Sets context for handlers
    // Can now access models with this.models
    server.bind({
        models: Models
    });

    server.route([
        {method: 'GET', path: '/users', config: Controllers.User.getAll},
        {method: 'GET', path: '/users/{id}', config: Controllers.User.get},
        {method: 'POST', path: '/users', config: Controllers.User.post},
        {method: 'PUT', path: '/users/{id}', config: Controllers.User.put},
        {method: 'DELETE', path: '/users/{id}', config: Controllers.User.delete},
		{ method: 'GET', path: '/tags', config:  Controllers.Tag.getAll},
		{ method: 'GET', path: '/tags/{id}', config: Controllers.Tag.get},
		{ method: 'POST', path: '/tags', config: Controllers.Tag.post},
		{ method: 'DELETE', path: '/tags/{id}', config: Controllers.Tag.delete}
	]);

    next();
};

exports.register.attributes = {
    name: 'api-routes',
    version: require('../../package.json').version,
    dependencies: ['controllers', 'models']
};
