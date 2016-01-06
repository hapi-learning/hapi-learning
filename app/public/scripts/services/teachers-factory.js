'use strict';

angular.module('hapi-learning.services')
    .factory('TeachersFactory', ['Restangular', '$q', function (Restangular, $q) {

        var internals = {};
        internals.teachers = [];

        var exports = {};

        exports.add = function (value) {
            internals.teachers.push(value);
        };

        exports.load = function (limit, page) {
            return $q(function (resolve) {
                resolve(internals.teachers.length > 0);
            }).then(function (hasTeachers) {
                if (hasTeachers) {
                    return internals.teachers;
                } else {
                    return Restangular
                        .all('teachers')
                        .getList()
                        .then(function(response) {
                            internals.teachers = response;
                            return internals.teachers;
                        });
                }
            })
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
