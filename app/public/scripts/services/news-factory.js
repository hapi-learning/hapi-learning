'use strict';

angular.module('hapi-learning.services')
    .factory('NewsFactory', [
    '$q',
    'Restangular',
    '$rootScope',
        function ($q, Restangular, $rootScope) {

            const exports = {
                getCourseNews: function(options) {
                    return Restangular.one('courses', options.code).customGET('news', {
                        limit: options.limit,
                        page: options.page
                    });
                },
                getSubscribedNews: function(options) {
                    return Restangular.all('me').customGET('news', options);
                },
                get: function(options) {
                    if (options.code) {
                        return this.getCourseNews(options);
                    } else {
                        return this.getSubscribedNews(options);
                    }
                },
                add: function (news) {
                    return Restangular.all('news').post({
                            username: $rootScope.$user.username,
                            code: news.course ? news.course : null,
                            content: news.content,
                            subject: news.subject,
                            priority: news.priority
                        });
                }
            };

            return exports;
    }]);
