'use strict';

exports.register = function (server, options, next) {

    const Cache       = server.plugins.cache.cache;
    const Storage     = server.plugins.storage.storage;
    const Controllers = server.plugins.controllers.controllers;
    const Models      = server.plugins.models.models;


    // Sets context for handlers
    // Can now access models with this.models
    server.bind({
        models: Models,
        storage: Storage,
        cache: Cache
    });

    server.route([

        {method: 'POST', path: '/login',  config: Controllers.Auth.login},
        {method: 'POST', path: '/logout', config: Controllers.Auth.logout},
        {method: 'GET',  path: '/me',     config: Controllers.Auth.me},

        // Users routes
        {method: 'GET',    path: '/users',                                   config: Controllers.User.getAll},
        {method: 'GET',    path: '/users/{username}',                        config: Controllers.User.get},
        {method: 'GET',    path: '/users/{username}/tags',                   config: Controllers.User.getTags},
        {method: 'GET',    path: '/users/{username}/courses',                config: Controllers.User.getCourses},
        {method: 'GET',    path: '/users/{username}/folders',                config: Controllers.User.getFolders},

        {method: 'GET',    path: '/teachers',                                config: Controllers.User.getTeachers},

        {method: 'POST',   path: '/users',                                   config: Controllers.User.post},
        {method: 'POST',   path: '/users/{username}/tags',                   config: Controllers.User.addTags},
        {method: 'POST',   path: '/users/{username}/subscribe/{crsId}',      config: Controllers.User.subscribeToCourse},
        {method: 'POST',   path: '/users/{username}/unsubscribe/{crsId}',    config: Controllers.User.unsubscribeToCourse},
        {method: 'POST',   path: '/users/{username}/folders',                config: Controllers.User.addFolders},
        {method: 'POST',   path: '/users/{username}/folders/{name}/{crsId}', config: Controllers.User.addCourseToFolder},
        {method: 'PUT',    path: '/users/{username}',                        config: Controllers.User.put},
        {method: 'PATCH',  path: '/users/{username}',                        config: Controllers.User.patch},
        {method: 'DELETE', path: '/users/{username}',                        config: Controllers.User.delete},

        // Roles routes
        {method: 'GET',    path: '/roles',       config: Controllers.Role.getAll},
        {method: 'GET',    path: '/roles/{name}',  config: Controllers.Role.get},
        {method: 'POST',   path: '/roles',       config: Controllers.Role.post},
        {method: 'DELETE', path: '/roles/{name}',  config: Controllers.Role.delete},

        // Permissions routes
        {method: 'GET', path: '/permissions',      config: Controllers.Permission.getAll},
        {method: 'GET', path: '/permissions/{type}', config: Controllers.Permission.get},

        // Tags routes
        {method: 'GET',    path: '/tags',      config:  Controllers.Tag.getAll},
        {method: 'GET',    path: '/tags/{name}', config: Controllers.Tag.get},
        {method: 'POST',   path: '/tags',      config: Controllers.Tag.post},
        {method: 'DELETE', path: '/tags/{name}', config: Controllers.Tag.delete},

        // Courses routes
        {method: 'GET',    path: '/courses',                        config: Controllers.Course.getAll},
        {method: 'GET',    path: '/courses/{id}',                   config: Controllers.Course.get},
        {method: 'GET',    path: '/courses/{id}/documents',         config: Controllers.Course.getDocuments},
        {method: 'GET',    path: '/courses/{id}/documents/{path*}', config: Controllers.Course.getDocuments},
        {method: 'GET',    path: '/courses/{id}/tree',              config: Controllers.Course.getTree},
        {method: 'GET',    path: '/courses/{id}/tree/{path*}',      config: Controllers.Course.getTree},
        {method: 'GET',    path: '/courses/{id}/students',          config: Controllers.Course.getStudents},
        {method: 'POST',   path: '/courses',                        config: Controllers.Course.post},
        {method: 'POST',   path: '/courses/{id}/tags',              config: Controllers.Course.addTags},
        {method: 'POST',   path: '/courses/{id}/teachers',          config: Controllers.Course.addTeachers},
        {method: 'POST',   path: '/courses/{id}/documents',         config: Controllers.Course.postDocument},
        {method: 'POST',   path: '/courses/{id}/documents/{path*}', config: Controllers.Course.postDocument},
        {method: 'POST',   path: '/courses/{id}/folders/{path*}' ,  config: Controllers.Course.createFolder},
        {method: 'PATCH',  path: '/courses/{id}/folders/{path*}',   config: Controllers.Course.updateFile},
        {method: 'PATCH',  path: '/courses/{id}/documents/{path*}', config: Controllers.Course.updateFile},
        {method: 'PATCH',  path: '/courses/{id}',                   config: Controllers.Course.patch},
        {method: 'DELETE', path: '/courses/{id}',                   config: Controllers.Course.delete},
        {method: 'DELETE', path: '/courses/{id}/documents',         config: Controllers.Course.deleteDocument},
        {method: 'DELETE', path: '/courses/{id}/tags',              config: Controllers.Course.deleteTags},
        {method: 'DELETE', path: '/courses/{id}/teachers',          config: Controllers.Course.deleteTeachers},

        // News routes
        {method: 'GET',    path: '/news',                        config: Controllers.News.getAll},
        {method: 'GET',    path: '/news/{id}',                        config: Controllers.News.get},
        {method: 'POST',    path: '/news',                        config: Controllers.News.post}


    ]);

    next();
};

exports.register.attributes = {
    name: 'api-routes',
    version: require('../../package.json').version,
    dependencies: ['hapi-pagination', 'storage', 'hapi-learning-auth', 'controllers', 'models']
};
