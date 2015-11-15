'use strict';

angular.module('hapi-learning')
    .factory('CoursesFactory', ['Restangular', function (Restangular) {

        var internals = {};
        internals.courses = [];

        var exports = {};
        exports.add = function (value) {
            internals.courses.push(value);
        };

        exports.load = function (limit, page) {
            return new Promise(function (resolve, reject) {
                Restangular.all('courses')
                    .customGET('', { limit: limit, page: page })
                    .then(function (object) {
                        resolve(object.results);
                    })
                    .catch(function (err) {
                        reject(err)
                    });
            })
        };
        
        exports.loadSpecific = function (code) {
            return new Promise(function (resolve, reject) {
                Restangular.one('courses', code)
                    .then(function (object) {
                        resolve(object);
                    })
                    .catch(function (err) {
                        reject(err)
                    });
            });
        };


        exports.get = function (index) {
            if (index) {
                return internals.courses[index];
            } else {
                return internals.courses;
            }
        };

        exports.clear = function () {
            internals.courses = [];
        };


        return exports;
}]);
