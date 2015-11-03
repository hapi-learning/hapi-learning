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

        {method: 'POST', path: '/login',  config: Controllers.Auth.login},
        {method: 'POST', path: '/logout', config: Controllers.Auth.logout},

        // Users routes
        {method: 'GET',    path: '/users',                             config: Controllers.User.getAll},
        {method: 'GET',    path: '/users/{username}',                  config: Controllers.User.get},
        {method: 'GET',    path: '/users/{username}/tags',             config: Controllers.User.getTags},
        {method: 'GET',    path: '/users/{username}/courses',          config: Controllers.User.getCourses},
        {method: 'POST',   path: '/users',                             config: Controllers.User.post},
        {method: 'POST',   path: '/users/{id}/subscribe/{crsId}',      config: Controllers.User.subscribeToCourse},
        {method: 'POST',   path: '/users/{id}/unsubscribe/{crsId}',    config: Controllers.User.unsubscribeToCourse},
        {method: 'POST',   path: '/users/{id}/folders/{name}',         config: Controllers.User.addFolder},
        {method: 'POST',   path: '/users/{id}/folders/{name}/{crsId}', config: Controllers.User.addCourseToFolder},
        {method: 'PUT',    path: '/users/{id}',                        config: Controllers.User.put},
        {method: 'DELETE', path: '/users/{id}',                        config: Controllers.User.delete},

        // Roles routes
        {method: 'GET',    path: '/roles',       config: Controllers.Role.getAll},
        {method: 'GET',    path: '/roles/{id}',  config: Controllers.Role.get},
        {method: 'POST',   path: '/roles',       config: Controllers.Role.post},
        {method: 'PUT',    path: '/roles/{id}',  config: Controllers.Role.put},
        {method: 'DELETE', path: '/roles/{id}',  config: Controllers.Role.delete},

        // Permissions routes
        {method: 'GET', path: '/permissions',      config: Controllers.Permission.getAll},
        {method: 'GET', path: '/permissions/{id}', config: Controllers.Permission.get},

        // Tags routes
        {method: 'GET',    path: '/tags',      config:  Controllers.Tag.getAll},
        {method: 'GET',    path: '/tags/{id}', config: Controllers.Tag.get},
        {method: 'POST',   path: '/tags',      config: Controllers.Tag.post},
        {method: 'DELETE', path: '/tags/{id}', config: Controllers.Tag.delete},

        // Courses routes
        {method: 'GET',    path: '/courses',                        config: Controllers.Course.getAll},
        {method: 'GET',    path: '/courses/{id}',                   config: Controllers.Course.get},
        {method: 'GET',    path: '/courses/{id}/documents',         config: Controllers.Course.getDocuments},
        {method: 'GET',    path: '/courses/{id}/documents/{path*}', config: Controllers.Course.getDocuments},
        {method: 'GET',    path: '/courses/{id}/tree',              config: Controllers.Course.getTree},
        {method: 'GET',    path: '/courses/{id}/tree/{path*}',      config: Controllers.Course.getTree},
        {method: 'GET',    path: '/courses/{id}/tags',              config: Controllers.Course.getTags},
        {method: 'GET',    path: '/courses/{id}/teachers',          config: Controllers.Course.getTeachers},
        {method: 'GET',    path: '/courses/{id}/students',          config: Controllers.Course.getStudents},
        {method: 'POST',   path: '/courses',                        config: Controllers.Course.post},
        {method: 'POST',   path: '/courses/{id}/documents',         config: Controllers.Course.postDocument},
        {method: 'POST',   path: '/courses/{id}/documents/{path*}', config: Controllers.Course.postDocument},
        {method: 'PUT',    path: '/courses/{id}',                   config: Controllers.Course.put},
        {method: 'DELETE', path: '/courses/{id}',                   config: Controllers.Course.delete},
        {method: 'DELETE', path: '/courses/{id}/documents',         config: Controllers.Course.deleteDocument},
        {method: 'DELETE', path: '/courses/{id}/documents/{path*}', config: Controllers.Course.deleteFolder}
    ]);

    next();
};

exports.register.attributes = {
    name: 'api-routes',
    version: require('../../package.json').version,
    dependencies: ['hapi-learning-auth', 'controllers', 'models']
};
