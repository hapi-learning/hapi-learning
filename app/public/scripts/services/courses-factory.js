'use strict';

angular.module('hapi-learning')
    .factory('CoursesFactory', [
    'Restangular',
    'LoginFactory',
    '$q',
    function (Restangular, LoginFactory, $q) {

            var internals = {};
            internals.courses = [];
            internals.fetchedCourses = false;
        
            internals.pagedCourses = [];
            internals.fetchedPagedCourses = false;
        
            internals.subscribedCourses = [];
            internals.fetchedSubscribed = false;
            internals.loadPaged = function (limit, page) {
                return $q(function (resolve, reject) {
                    if (!internals.fetchedPagedCourses) {
                        Restangular.all('courses')
                            .customGET('', {
                                limit: limit,
                                page: page
                            })
                            .then(function (object) {
                                internals.pagedCourses = object.results;
                                internals.fetchedPagedCourses = true;
                                resolve(object.results);
                            })
                            .catch(function (err) {
                                reject(err)
                            });
                    }
                    else {
                        resolve(internals.pagedCourses);
                    }
                });
            };
            internals.loadAll = function () {
                return $q(function (resolve, reject) {
                    if (!internals.fetchedCourses) {
                        Restangular.all('courses')
                            .customGET('', {})
                            .then(function (object) {
                                internals.courses = object.results;
                                internals.fetchedCourses = true;
                                resolve(object.results);
                            })
                            .catch(function (err) {
                                reject(err)
                            });
                    }
                    else {
                        resolve(internals.courses);
                    }
                });
            };

            var exports = {};
            exports.add = function (value) {
                // TO-DO
                internals.courses.push(value);
            };

            /**
                Courses fetching, return asynchronous promise fill with them.
                Results are going to be saved in factory to avoid server fetching
                for every request.
            **/
            exports.load = function (limit, page) {
                if (limit && page)
                {
                    return internals.loadPaged(limit, page);
                }
                else
                {
                    return internals.loadAll();
                }
            };

            /**
                Load a specific course
            **/
            exports.loadSpecific = function (code) {

                return $q(function (resolve, reject) {
                    Restangular.one('courses', code)
                        .get()
                        .then(function (object) {
                            resolve(object);
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                });
            };

            /**
                Try to subscribe a course to a user (/users/{id}/subscribe/{courseId}).
                It should return the subscribed course if success. This will be added
                to local subscribed courses.

                /!\ WIP : Does not return course atm, so subscribed course is clear.
            **/
            exports.subscribe = function (code) {
                return $q(function (resolve, reject) {
                    LoginFactory.getProfile().then(function (profile) {
                        Restangular.one('users', profile.username)
                            .customPOST({}, 'subscribe/' + code)
                            .then(function (cours) {
                                internals.subscribedCourses.push(cours);
                                resolve(cours);
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                    }).catch(function (error) {});

                });
            };

            /**
                Try to unsubscribe a course to a user (/users/{id}/unsubscribe/{courseId}).
                It should return the subscribed course if success. This will be removed
                from local subscribed courses.
            **/
            exports.unsubscribe = function (code) {
                return $q(function (resolve, reject) {
                    LoginFactory.getProfile().then(function (profile) {
                        Restangular.one('users', profile.username)
                            .customPOST({}, 'unsubscribe/' + code)
                            .then(function (object) {
                                _.remove(internals.subscribedCourses, function (course) {
                                    return course.code === code;
                                });
                                resolve(object);
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                    });
                });
            };

            /**
                Load every courses subscribed by current user (GET /users/{id}/courses).
                If they are already loaded, (internals.subscribedCourse) it will not.
            **/
            exports.getSubscribed = function () {
                return $q(function (resolve, reject) {
                    if (!internals.fetchedSubscribed) {
                        LoginFactory.getProfile().then(function (profile) {

                            Restangular.one('users', profile.username)
                                .getList('courses')
                                .then(function (subscribedCourses) {
                                    internals.subscribedCourses = subscribedCourses;
                                    internals.fetchedSubscribed = true;
                                    resolve(internals.subscribedCourses);
                                })
                                .catch(function (error) {
                                    reject(error);
                                });
                        }).catch(function (error) {});

                    }
                    else {
                        resolve(internals.subscribedCourses);
                    }
                });
            };

            exports.get = function (index) {
                if (index) {
                    return internals.courses[index];
                }
                else {
                    return internals.courses;
                }
            };

            exports.clear = function () {
                internals.courses = [];
            };


            return exports;
}]);
