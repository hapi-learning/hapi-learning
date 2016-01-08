'use strict';

angular.module('hapi-learning.services')
    .factory('CoursesFactory', [
        '$rootScope',
        'Restangular',
        '$q',
        'lodash',
        'Rip',

    function ($rootScope, Restangular, $q, _, Rip) {

        var internals = {};
        var exports = {};

        internals.courses = new Rip.Model('courses');
        internals.users   = new Rip.Model('users');
        internals.me      = new Rip.Model('me');

        internals.fetchedSubscribed = false;
        internals.subscribedCourses = [];

        exports.add = function (course) {

            var teachers = _.map(course.teachers, function(teacher) { return teacher.username; });
            var tags     = _.map(course.tags, function(tag) { return tag.name; });

            return internals.courses.post({
                code : course.code,
                name : course.name,
                homepage : course.homepage,
                teachers : teachers,
                tags : tags
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

            internals.courses.get(where).then(function (results) {

                d.resolve(results);
            }).catch(function (error) {

                d.reject(error);
            });

            return d.promise;
        };

        exports.loadCodes = function() {

            return internals.courses.get({
                pagination: false,
                select: ['code']
            });
        };

        exports.loadNames = function() {

            return internals.courses.get({
                pagination: false,
                select: ['name']
            });
        };

        /**
            Load a specific course
        **/
        exports.loadSpecific = function (code) {

            return internals.courses.one(code).get();
        };

        /**
            Try to subscribe a course to a user (/users/{id}/subscribe/{courseId}).
            It should return the subscribed course if success. This will be added
            to local subscribed courses.

            /!\ WIP : Does not return course atm, so subscribed course is clear.
        **/
        exports.subscribe = function (code) {

            return internals.users
                    .one($rootScope.$user.username)
                    .one('subscribe', code)
                    .post().then(function (course) {

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

            return internals.users
                .one($rootScope.$user.username)
                .one('unsubscribe', code)
                .post().then(function (course) {

                    _.remove(internals.subscribedCourses, function (sub) {

                        return sub.code === code;
                    });

                    return course;
            });
        };

        /**
            Load every courses subscribed by current user (GET /users/{id}/courses).
            If they are already loaded, (internals.subscribedCourse) it will not.
        **/
        exports.getSubscribed = function () {

            if (internals.fetchedSubscribed) {
                return $q.resolve(internals.subscribedCourses);
            } else {
                return internals.me.all('courses').get().then(function (courses) {
                    internals.subscribedCourses = courses;
                    internals.fetchedSubscribed = true;
                    return internals.subscribedCourses;
                });
            }


        };

        exports.isSubscribed = function (course) {
            return exports.getSubscribed().then(function (courses) {
                return _.find(courses, 'code', course) ? true : false;
            });
        };

        exports.clear = function () {
            internals.subscribedCourses = [];
            internals.fetchedSubscribed = false;
        };

        // TODO - Change with app config
        $rootScope.$on('end-session', function() {
            exports.clear();
        });


        exports.getSubscribed();

        return exports;
}]);
