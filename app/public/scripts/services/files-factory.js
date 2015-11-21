'use strict';

angular.module('hapi-learning')
    .factory('FilesFactory', ['Restangular' , '$q', function(Restangular, $q) {

        var internals = {};
        var exports = {};

        internals.get = function(course, path, recursive) {
            return $q(function(resolve, reject) {
                Restangular
                    .all('course', course)
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

        return exports;

    }]);
