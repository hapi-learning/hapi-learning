'use strict';

angular.module('hapi-learning.services').factory('NewsFactory', [
    '$q', 'Rip', '$rootScope',
    function ($q, Rip, $rootScope) {

        var exports = {};
        var internals = {};
        internals.news = new Rip.Model('news');
        internals.courses = new Rip.Model('courses');
        internals.me = new Rip.Model('me');

        exports.getCourseNews = function(options) {

            return internals.courses.one(options.code).all('news').get({
                limit: options.limit,
                page: options.page
            });
        };

        exports.getSubscribedNews = function(options) {

            return internals.me.all('news').get(options);
        };

        exports.get = function(options) {

            if (options.code) {
                return exports.getCourseNews(options);
            } else {
                return exports.getSubscribedNews(options);
            }
        };

        exports.add = function (news) {

            return internals.news.post({
                username: $rootScope.$user.username,
                code: news.course ? news.course : null,
                content: news.content,
                subject: news.subject,
                priority: news.priority
            });
        };

        return exports;
}]);
