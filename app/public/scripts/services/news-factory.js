'use strict';

angular.module('hapi-learning')
    .factory('NewsFactory', [
    '$q',
    'Restangular',
    'LoginFactory',
    '$rootScope',
        function ($q, Restangular, LoginFactory, $rootScope) {

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
                }
            };

            return exports;
    }]);
