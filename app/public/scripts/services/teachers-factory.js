'use strict';

angular.module('hapi-learning')
    .factory('TeachersFactory', ['Restangular', function (Restangular) {

        var internals = {};
        internals.teachers = [];

        var exports = {};
        exports.add = function (value) {
            internals.teachers.push(value);
        };

        exports.load = function (limit, page) {
            return new Promise(function (resolve, reject) {
                if (internals.teachers.length === 0)
                {
                    Restangular
                    .all('teachers')
                    .customGET('', { limit: limit, page: page })
                    .then(function(object) {
                        internals.teachers = object.results;
                        resolve(object.results);
                    })
                    .catch(reject);
                }
                else
                {
                    resolve(internals.teachers);
                }
            });
        };

        exports.get = function (index) {
            if (index) {
                return internals.teachers[index];
            } else {
                return internals.teachers;
            }
        };

        exports.clear = function () {
            internals.teachers = [];
        };


        return exports;
}]);