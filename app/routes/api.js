'use strict'

exports.register = function (server, options, next) {

    var Controllers = server.plugins.controllers.controllers;
    var Models      = server.plugins.models.models;


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
        {method: 'DELETE', path: '/users/{id}', config: Controllers.User.delete}
    ]);

    // Routes for rest connection here

    next();
};

exports.register.attributes = {
    name: 'api-routes',
    version: require('../../package.json').version,
    dependencies: ['controllers', 'models']
};
