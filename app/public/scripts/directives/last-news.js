'use strict';

angular.module('hapi-learning')
    .directive('lastNews', [
    'NewsFactory',
    '$rootScope',
    function (NewsFactory, $rootScope) {
            return {
                restrict: 'E',
                scope: {
                    count: '=',
                    code: '=',
                    subscribed: '='
                },
                templateUrl: 'templates/last-news.html',
                link: function (scope, element, attrs) {
                    scope.news = [];

                    var options = {
                        count: scope.count,
                        subscribed: scope.subscribed ? true : false,
                        code: scope.code
                    };

           /*         var on_handlers = {
                        news_add: function (event, news) {
                            if (!scope.code || news.code === scope.code) {
                                var tmp = [news].concat(scope.news);
                                scope.news = _.map(tmp, function (news) {
                                    return news;
                                });
                            }
                        },
                        unsubscribe: function (event, course) {
                            _.remove(scope.news, function (news) {
                                return news.course === course.code;
                            });
                        },
                        subscribe: function (event, course) {
                            NewsFactory.loadSpecific(course.code)
                            .then(function (news) {
                                scope.news = scope.news.concat(news);
                            })
                            .catch(function (error){
                                console.log(error);
                            });
                        }
                    };*/


                    NewsFactory.load(options)
                        .then(function (news) {
                            scope.news = news;
                            $rootScope.$on('news_added', on_handlers.news_add);
                            if (!scope.code)
                            {
                                $rootScope.$on('unsubscribe', on_handlers.unsubscribe);
                                $rootScope.$on('subscribe', on_handlers.subscribe);
                            }
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }
            };
}]);
