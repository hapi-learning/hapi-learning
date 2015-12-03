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
                return $q(function (resolve, reject) {
                    if (internals.fetched) {
                        resolve(internals.slice(count));
                    }
                    else {
                        Restangular.all('news')
                            .getList()
                            .then(function (news) {
                                internals.news = news;
                                internals.fetched = true;
                                resolve(internals.slice(count));
                            })
                            .catch(function (err) {
                                reject(err)
                            });
                    }
                });
            };

            exports.add = function (news) {
                return $q(function (resolve, reject) {

                    LoginFactory.getProfile()
                        .then(function (profile) {
                            Restangular.all('news')
                                .post({
                                    username: profile.username,
                                    code: news.course ? news.course : null,
                                    content: news.content,
                                    subject: news.subject
                                })
                                .then(function (news) {
                                    if (internals.fetched) {
                                        internals.news.push(news);
                                    }
                                    $rootScope.$emit('news_added', news);
                                    resolve(news);
                                })
                                .catch(function (err) {
                                    reject(err);
                                });
                        })
                        .catch(function (error) {
                            reject(error);
                        });

                });
            };

            return exports;
    }]);
