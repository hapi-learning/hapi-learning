'use strict';

angular.module('hapi-learning.services')
    .factory('FilesFactory', [
        'Rip',
        '$q',
        '$http',
        '$config',
        'AuthStorage',

    function(Rip, $q, $http, $config, AuthStorage) {

        var internals = {};
        var exports = {};

        internals.courses = new Rip.Model('courses');

        internals.replacePath = function(path) {

            // ui router does not replace %2F by / ...
            // (but does replace %20 by space)
            path = path.replace(/%2F/g, '/');

            if (path[0] === '/') {
                path = path.substr(1);
            }

            return path;
        };

        internals.getUrl = function(course, path) {

            path = internals.replacePath(path);
            return $config.$apiPrefix + '/courses/' + course + '/documents/' + path;
        };


        internals.get = function(course, path, showHidden) {

            path = internals.replacePath(path);
            return internals.courses
                .one(course)
                .all('tree')
                .all(encodeURIComponent(path))
                .get({
                    hidden: showHidden
                });
        };

        exports.getUploadPath = function(course, path) {

            path = internals.replacePath(path);
            path = encodeURIComponent(path);
            return $config.$apiPrefix + '/courses/' + course + '/documents/' + path;
        };

        exports.getList = function(course, path, showHidden) {

            return internals.get(course, path, showHidden);
        };

        exports.updateFolder = function(course, path, newName, hidden) {

            path = internals.replacePath(path);
            return internals.courses.one(course).all('folders').all(encodeURIComponent(path)).patch({
                name: newName,
                hidden: hidden
            });
        };

        exports.updateFile = function(course, path, newName, hidden) {

            path = internals.replacePath(path);
            return internals.courses.one(course).all('documents').all(encodeURIComponent(path)).patch({
                name: newName,
                hidden: hidden
            });
        };

        exports.createFolder = function(course, path, hidden) {

            path = internals.replacePath(path);
            return internals.courses.one(course).all('folders').all(encodeURIComponent(path)).post({
                hidden: hidden
            });
        };

        exports.deleteDocument = function(course, path) {

            path = internals.replacePath(path);
            return internals.courses.one(course).all('documents').headers({
                'Content-Type': 'application/json; charset=UTF-8'
            }).delete({
                files: path
            });
        };

        exports.getDownloadPath = function(course, path, showHidden) {

            var url = internals.getUrl(course, path);
            url += '?hidden=' + showHidden;
            url += '&token=' + AuthStorage.get('token');

            return url;
        };

        return exports;

    }]);
