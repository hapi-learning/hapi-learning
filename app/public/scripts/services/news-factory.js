'use strict';

angular.module('hapi-learning')
    .factory('NewsFactory', [
    '$q',
    'Restangular',
    'LoginFactory',
    '$rootScope',
        function ($q, Restangular, LoginFactory, $rootScope) {

            const internals = {
                news: [],
                fetched: false,
                clear: function() {
                    fetched = false;
                    news = [];
                },
                slice: function (count) {
                    // count has to be a number :
                    // slice(0, ..) with null return empty, negative numbers return truncated array, ...
                    if (typeof count === 'number' && count > 0 && count <= internals.news.length) {
                        return internals.news.slice(0, count);
                    }
                    else {
                        return internals.news;
                    }
                }
            };

            const exports = {};

            exports.load = function (count) {
                return $q(function(resolve) {
                    resolve(internals.fetched);
                }).then(function(fetched) {
                    if (fetched) {
                        return internals.slice(count);
                    }  else {
                        return Restangular.all('news').getList().then(function(news) {
                            internals.news = news;
                            internals.fetched = true;
                            return internals.slice(count);
                        });
                    }
                });
            };

            exports.add = function (news) {
                return LoginFactory.getProfile().then(function (profile) {
                    return Restangular.all('news').post({
                            username: profile.username,
                            code: news.course ? news.course : null,
                            content: news.content,
                            subject: news.subject,
                            priority: news.priority
                        })
                        .then(function (news) {
                            if (internals.fetched) {
                                internals.news.push(news);
                            }
                            $rootScope.$emit('news_added', news);
                            return news;
                        });
                });
            };

            $rootScope.$on('um.end-session', function() {
                internals.clear();
            });

            return exports;
    }]);
