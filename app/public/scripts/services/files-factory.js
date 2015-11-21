'use strict';

angular.module('hapi-learning')
    .factory('FilesFactory', ['Restangular' , '$q', '$http', function(Restangular, $q, $http) {

        var internals = {};
        var exports = {};

        internals.replacePath = function(path) {
            path = path.replace('%2F', '/');

            if (path[0] === '/') {
                path = path.substr(1);
            }

            return path;
        };

        internals.get = function(course, path, recursive) {
            return $q(function(resolve, reject) {

                path = internals.replacePath(path);

                Restangular
                    .one('courses', course)
                    .all('tree')
                    .customGET(path, { recursive: recursive })
                    .then(function(results) {
                        resolve(results);
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            });
        };

        exports.getList = function(course, path) {
            return internals.get(course, path, false);
        };

        exports.getTree = function(course, path) {
            return internals.get(course, path, true);
        };

        exports.getDownloadPath = function(course, path) {
            //path = internals.replacePath(path);
            path = path.replace('%2F', '/')
            var url = Restangular.configuration.baseUrl + '/courses/' + course + '/documents' + path
            return url;
        };

        exports.download = function(course, path) {

          //  path = internals.replacePath(path);

            return $q(function(resolve, reject) {
                $http({
                    method: 'GET',
                    url: exports.getDownloadPath(course, path),
                }).then(function() {
                    resolve();
                }).catch(function() {
                    reject();
                });
            });
        };

        return exports;

    }]);
