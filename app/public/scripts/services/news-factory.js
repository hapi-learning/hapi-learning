'use strict';

angular.module('hapi-learning')
    .factory('NewsFactory', [
    '$q',
    'Restangular',
    'LoginFactory',
    '$rootScope',
        function ($q, Restangular, LoginFactory, $rootScope) {

            const exports = {
                load: function (options) {
                    return $q(function (resolve) {
                        if (options.subscribed) {
                            return resolve(Restangular.all('me').get('news'));
                        }
                        else {
                            return resolve(Restangular.all('news').getList());
                        }
                    }).then(function (news) {
                        if (options.code) {
                            return _.filter(news, function (news) {
                                return news.course === options.code;
                            });
                        }
                        else {
                            return news;
                        }
                    }).then(function (news) {
                        if (typeof options.count === 'number' && options.count > 0 && options.count <= news.length) {
                            return news.slice(0, options.count);
                        }
                        else {
                            return news;
                        }
                    });
                },
                loadSpecific: function (code) {
                    return Restangular.one('courses', code).one('news').get();
                },
                add: function (news) {
                    return LoginFactory.getProfile().then(function (profile) {
                        return Restangular.all('news').post({
                                username: profile.username,
                                code: news.course ? news.course : null,
                                content: news.content,
                                subject: news.subject,
                                priority: news.priority
                            })
                            .then(function (news) {
                                $rootScope.$emit('news_added', news);
                                return news;
                            });
                    });
                }
            };  

            return exports;
    }]);
