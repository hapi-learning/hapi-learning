'use strict';

angular.module('hapi-learning')
    .factory('NewsFactory', [
    '$q',
    'Restangular',
    'LoginFactory',
        function ($q, Restangular, LoginFactory) {

            const internals = {
                news: [],
                fetched: false,
                slice : function(count) {
                    // count has to be a number :
                    // slice(0, ..) with null return empty, negative numbers return truncated array, ...
                    if (typeof count === 'number' && count > 0 && count <= internals.news.length) {
                        return internals.news.slice(0, count);
                    } else {
                        return internals.news;
                    }
                }
            };

            const exports = {};

            exports.load = function (count) {
                return $q(function (resolve, reject) {
                    if (internals.fetched) {
                        resolve(internals.slice(count));
                    } else {
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
                    Restangular.all('news')
                        .post({
                            subject: news.subject,
                            content: news.content,
                            username: LoginFactory.getProfile().username,
                            code: (news.course === '') ? null : news.course
                        })
                        .then(function (news) {
                            console.log(news);

                            if (internals.fetched) {
                                internals.news.push(news);
                            }

                            resolve(news);
                        })
                        .catch(function (err) {
                        console.log(err);
                            reject(err);
                        });
                });
            };

            return exports;
    }]);
