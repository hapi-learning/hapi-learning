'use strict';

angular.module('hapi-learning')
    .factory('CoursesFactory', ['Restangular', 'LoginFactory', function (Restangular, LoginFactory) {

        var internals = {};
        internals.courses = [];
        internals.subscribedCourses = [];

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
                    .get()
                    .then(function (object) {
                        resolve(object);
                    })
                    .catch(function (err) {
                        reject(err)
                    });
            });
        };

        exports.subscribe = function (code) {
            return new Promise(function (resolve, reject) {
                Restangular.one('users', LoginFactory.getProfile().username)
                    .customPOST({}, "subscribe/" + code)
                    .then(function (object) {
                        resolve(object);
                    })
                    .catch(function (err) {
                        reject(err)
                    });
            });
        };

        exports.unsubscribe = function (code) {
            return new Promise(function (resolve, reject) {
                Restangular.one('users', LoginFactory.getProfile().username)
                .customPOST({}, "unsubscribe/" + code)
                .then(function (object) {
                    resolve(object);
                })
                .catch(function (err) {
                    reject(err)
                });
            });
        };

        exports.getSubscribed = function () {
            return new Promise(function (resolve, reject) {
                Restangular.one('users', LoginFactory.getProfile().username)
                    .getList('courses')
                    .then(function (object) {
                        resolve(object);
                    })
                    .catch(function (error) {
                        reject(error);
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
