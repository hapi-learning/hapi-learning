'use strict';

angular.module('hapi-learning')
    .factory('CoursesFactory', ['Restangular',
                                'LoginFactory',
                                '$q',
            function (Restangular, LoginFactory, $q) {

        var internals = {};
        internals.courses = [];
        internals.subscribedCourses = [];

        var exports = {};
        exports.add = function (value) {
            internals.courses.push(value);
        };

        exports.load = function (limit, page) {

            if (internals.courses.length === 0)
            {
                return $q(function (resolve, reject) {
                    Restangular.all('courses')
                        .customGET('', { limit: limit, page: page })
                        .then(function (object) {
                            internals.courses = object.results;
                            resolve(object.results);
                        })
                        .catch(function (err) {
                            reject(err)
                        });
                    });
            }
            else
            {
                return new Promise(function (resolve, reject) {
                    resolve(internals.courses);
                });
            }
        };

        exports.loadSpecific = function (code) {
            return $q(function (resolve, reject) {
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
            return $q(function (resolve, reject) {

                LoginFactory.getProfile().then(function(profile) {
                    Restangular.one('users', profile.username)
                        .customPOST({}, "subscribe/" + code)
                        .then(function (object) {
                            //_.fill(internals.subscribedCourses, object); // object doit être le cours

                            // WHAT ? -- FIX
                            internals.subscribedCourses = [];
                            resolve(object);
                        })
                        .catch(function (err) {
                            reject(err)
                        });
                }).catch(function(error) {});

            });
        };

        exports.unsubscribe = function (code) {
            return $q(function (resolve, reject) {

                LoginFactory.getProfile().then(function(profile) {
                    Restangular.one('users', profile.username)
                    .customPOST({}, "unsubscribe/" + code)
                    .then(function (object) {
                        _.remove(internals.subscribedCourses, function(course) {return course.code === code});
                        resolve(object);
                    })
                    .catch(function (err) {
                        reject(err)
                    });

                }).catch(function(error) {});
            });
        };

        exports.getSubscribed = function () {

            return $q(function(resolve, reject) {
                if (internals.subscribedCourses.length === 0) {
                    LoginFactory.getProfile().then(function(profile) {

                        Restangular.one('users', profile.username)
                            .getList('courses')
                            .then(function(object) {
                                internals.subscribedCourses = object;
                                resolve(internals.subscribedCourses);
                            })
                            .catch(function(error) {
                                reject(error);
                            });
                    }).catch(function(error) {})

                } else {
                    resolve(internals.subscribedCourses);
                }
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
