'use strict'

exports.register = function (server, options, next) {

    var Controllers = server.plugins.controllers.controllers;
    var Models      = server.plugins.models.models;

    // Sets context for handlers
    // Can now access models with this.models
    server.bind({
        models: Models
    });


    // Routes for rest connection here

    next();
};

exports.register.attributes = {
    name: 'api-routes',
    version: require('../../package.json').version,
    dependencies: ['controllers', 'models']
};
