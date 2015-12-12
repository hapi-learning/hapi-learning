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
                subscribed: [],
                subscribedFetched: false,
                clear: function () {
                    news = [];
                    fetched = false;
                    subscribed = [];
                    subscribedFetched = false;
                }
            };

            const exports = {
                load: function (options) {
                    console.log(options);
                    return $q(function (resolve) {
                        if (options.subscribed) 
                            resolve(internals.subscribedFetched);
                        else 
                            resolve(internals.fetched);
                    }).then(function (fetched) {
                        if (fetched) {
                            return options.subscribed ? internals.subscribed : internals.news;
                        }
                        else if (options.subscribed) {
                            console.log('fetch me news');
                            return Restangular.all('me').get('news').then(function (news) {
                                internals.subscribed = news;
                                internals.subscribedFetched = true;
                                return internals.subscribed;
                            });
                        }
                        else {
                            console.log('fetch every news');
                            return Restangular.all('news').getList().then(function (news) {
                                internals.news = news;
                                internals.fetched = true;
                                return internals.news;
                            });
                        }
                    }).then(function (news) {
                        if (options.code) {
                            console.log('specific news');
                            return _.filter(news, 'course', options.code);
                        }
                        else
                        {
                            console.log('not specific news');
                            return news;
                        }
                    }).then(function (news) {
                        if (typeof options.count === 'number' && options.count > 0 && options.count <= news.length) {
                            console.log('slice');
                            return news.slice(0, options.count);
                        }
                        else {
                            console.log('not slice');
                            return news;
                        }
                    })
                },
/*                load: function (count) {
                    return $q(function (resolve) {
                        resolve(internals.fetched);
                    }).then(function (fetched) {
                        if (fetched) {
                            return internals.slice(count);
                        }
                        else {
                            return Restangular.all('news').getList().then(function (news) {
                                internals.news = news;
                                internals.fetched = true;
                                return internals.slice(count);
                            });
                        }
                    });
                },*/
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
                                if (internals.fetched) {
                                    internals.news.push(news);
                                }
                                $rootScope.$emit('news_added', news);
                                return news;
                            });
                    });
                }
            };

            $rootScope.$on('um.end-session', function () {
                internals.clear();
            });

            return exports;
    }]);
