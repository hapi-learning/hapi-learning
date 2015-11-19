'use strict';

angular.module('hapi-learning')
    .factory('FilesFactory', ['Restangular' , '$q', function(Restangular, $q) {
        var exports = {};

        exports.getTree = function(course, path) {
            return $q(function(resolve, reject) {
                Restangular
                .all('courses', course)
                .customGET(path)
                .then(function(tree) {
                    resolve(tree);
                })
                .catch(function(err) {
                    reject(err);
                });
            });
        };

    }]);
