'use strict';

angular.module('hapi-learning')
    .factory('NewsFactory', [
    '$q',
    'Restangular',
    'LoginFactory',
        function ($q, Restangular, LoginFactory) {

            const internals = {
                news: [],
                fetched: false
            };

            const exports = {};

            exports.load = function (count) {
                return $q(function (resolve, reject) {
                    if (internals.fetched) {
                        resolve(internals.news);
                    } else {
                        Restangular.all('news')
                            .getList()
                            .then(function (news) {
                                internals.news = news.results;
                                internals.fetched = true;

                                if (typeof count === 'number' && count > 0) {
                                    resolve(internals.news.slice(0, count));
                                } else {
                                    resolve(internals.news);
                                }
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
                            username: LoginFactory.getProfile().username,
                            code: (news.code === '') ? null : news.code,
                            subject: news.subject,
                            content: news.content
                        })
                        .than(function (news) {
                            console.log(news);
                        
                            if (internals.fetched) {
                                _.fill(internals.news, news);
                            }
                        
                            resolve(news);
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                });
            };

            return exports;
    }]);
