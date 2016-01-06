'use strict';

angular.module('hapi-learning.services')
    .factory('FilesFactory', [
        'Restangular',
        '$q',
        '$http',
        'AuthStorage',

    function(Restangular, $q, $http, AuthStorage) {

        var internals = {};
        var exports = {};

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
            return Restangular.configuration.baseUrl + '/courses/' + course + '/documents/' + path;
        };


        internals.get = function(course, path, showHidden) {
            path = internals.replacePath(path);

            return Restangular
                .one('courses', course)
                .all('tree')
                .customGET(encodeURIComponent(path), {
                    hidden: showHidden
                })
                .then(function(results) {
                    return results;
                });
        };

        exports.getUploadPath = function(course, path) {
            path = internals.replacePath(path);
            path = encodeURIComponent(path);
            return Restangular.configuration.baseUrl + '/courses/' + course + '/documents/' + path;
        };

        exports.getList = function(course, path, showHidden) {
            return internals.get(course, path, showHidden);
        };

        exports.updateFolder = function(course, path, newName, hidden) {

            path = internals.replacePath(path);
            return Restangular
                .one('courses', course)
                .all('folders')
                .customOperation('patch', encodeURIComponent(path), null, null, {
                    name: newName,
                    hidden: hidden
                });
        };

        exports.updateFile = function(course, path, newName, hidden) {

            path = internals.replacePath(path);
            return Restangular
                .one('courses', course)
                .all('documents')
                .customOperation('patch', encodeURIComponent(path), null, null, {
                    name: newName,
                    hidden: hidden
                });
        };

        exports.createFolder = function(course, path, hidden) {

            path = internals.replacePath(path);
            return Restangular
                .one('courses', course)
                .all('folders')
                .customPOST(null, encodeURIComponent(path), {
                    hidden: hidden
                });
        };

        exports.deleteDocument = function(course, path) {
            path = internals.replacePath(path);
            return Restangular
                .one('courses', course)
                .all('documents')
                .customOperation('remove', null, null, {
                    'Content-Type': 'application/json; charset=UTF-8'
                }, {
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
