'use strict';

angular.module('hapi-learning')
    .factory('CoursesFactory', [
    '$rootScope',
    'Restangular',
    'LoginFactory',
    '$q',
    function ($rootScope, Restangular, LoginFactory, $q) {

        var internals = {};
        var exports = {};

        internals.fetchedSubscribed = false;
        internals.subscribedCourses = [];

        exports.add = function (course) {

            var teachers = _.map(course.teachers, function(teacher) { return teacher.username; });
            var tags     = _.map(course.tags, function(tag) { return tag.name; });

            return Restangular.all('courses')
            .post({
                code : course.code,
                name : course.name,
                homepage : course.homepage,
                teachers : teachers,
                tags : tags
            })
            .then(function (course) {
                return course;
            });
        };

        /**
         *  Courses fetching, return asynchronous promise fill with them.
         */
        exports.load = function (options) {

            var d = $q.defer();

            var codename = options.codename;
            var tags = options.tags;
            var page = options.page;
            var limit = options.limit;

            if (tags && (page || limit)) {
                d.reject('Cannot request tags with pagination');
            }

            var where = {};

            if (codename) {
                where.codename = codename;
            }

            if (page) {
                where.page = page;
            }

            if (limit) {
                where.limit = limit;
            }

            if (tags) {
                where.tags = tags;
                where.pagination = false;
            }



            Restangular
                .all('courses')
                .customGET('', where)
                .then(function(results) {
                    d.resolve(results);
                })
                .catch(function(error) {
                    d.reject(error);
                });

            return d.promise;
        };

        exports.loadCodes = function() {
            return Restangular.all('courses').customGET('', {
                pagination: false,
                select: ['code']
            });
        };

        exports.loadNames = function() {
            return Restangular.all('courses').customGET('', {
                pagination: false,
                select: ['name']
            });
        };

        /**
            Load a specific course
        **/
        exports.loadSpecific = function (code) {
            return Restangular.one('courses', code).get();
        };

        /**
            Try to subscribe a course to a user (/users/{id}/subscribe/{courseId}).
            It should return the subscribed course if success. This will be added
            to local subscribed courses.

            /!\ WIP : Does not return course atm, so subscribed course is clear.
        **/
        exports.subscribe = function (code) {
            return LoginFactory.getProfile().then(function (profile) {
                return Restangular.one('users', profile.username).customPOST({}, 'subscribe/' + code);
            }).then(function (course) {
                internals.subscribedCourses.push(course);
                return course;
            });
        };

        /**
            Try to unsubscribe a course to a user (/users/{id}/unsubscribe/{courseId}).
            It should return the subscribed course if success. This will be removed
            from local subscribed courses.
        **/
        exports.unsubscribe = function (code) {
            return LoginFactory.getProfile().then(function (profile) {
                return Restangular.one('users', profile.username).customPOST({}, 'unsubscribe/' + code);
            }).then(function (object) {
                _.remove(internals.subscribedCourses, function (course) {
                    return course.code === code;
                });

                return object;
            });
        };

        /**
            Load every courses subscribed by current user (GET /users/{id}/courses).
            If they are already loaded, (internals.subscribedCourse) it will not.
        **/
        exports.getSubscribed = function () {

            return LoginFactory.getProfile().then(function (profile) {
                if (internals.fetchedSubscribed) {
                    return internals.subscribedCourses;
                } else {
                    return Restangular
                        .all('me')
                        .get('courses')
                        .then(function (subscribedCourses) {
                            internals.subscribedCourses = subscribedCourses;
                            internals.fetchedSubscribed = true;
                            return internals.subscribedCourses;
                        });
                }
            });


        };

        exports.clear = function () {
            internals.subscribedCourses = [];
            internals.fetchedSubscribed = false;
        };

        $rootScope.$on('um.end-session', function() {
            exports.clear();
        });


        return exports;
}]);
