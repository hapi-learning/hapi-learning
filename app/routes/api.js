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
        {method: 'GET', path: '/users/{id}/tags', config: Controllers.User.getTags},
        {method: 'GET', path: '/users/{id}/courses', config: Controllers.User.getCourses},
        {method: 'POST', path: '/users', config: Controllers.User.post},
        {method: 'POST', path: '/users/{id}/courses/{courseId}/subscribe',
            config: Controllers.User.subscribeToCourse},

        {method: 'POST', path: '/users/{id}/courses/{courseId}/unsubscribe',
            config: Controllers.User.unsubscribeToCourse},

        {method: 'POST', path: '/users/{id}/folders/{name}', config: Controllers.User.addFolder},
        {method: 'POST', path: '/users/{id}/folders/{name}/courses/{courseId}',
            config: Controllers.User.addCourseToFolder},

        {method: 'PUT', path: '/users/{id}', config: Controllers.User.put},
        {method: 'DELETE', path: '/users/{id}', config: Controllers.User.delete},

        {method: 'GET', path: '/tags', config:  Controllers.Tag.getAll},
        {method: 'GET', path: '/tags/{id}', config: Controllers.Tag.get},
        {method: 'POST', path: '/tags', config: Controllers.Tag.post},
        {method: 'DELETE', path: '/tags/{id}', config: Controllers.Tag.delete}
    ]);

    next();
};

exports.register.attributes = {
    name: 'api-routes',
    version: require('../../package.json').version,
    dependencies: ['controllers', 'models']
};
