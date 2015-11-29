'use strict';

angular.module('hapi-learning')
    .directive('lastNews', [
    'NewsFactory',
    function (NewsFactory) {
            return {
                restrict: 'E',
                scope: {
                    count: '=',
                    code: '='
                },
                templateUrl: 'scripts/directives/last-news.html',
                link: function (scope, element, attrs) {
                    scope.news = [];
                    scope.fetched = false;

                    NewsFactory.load(scope.code ? null : scope.count)
                        .then(function (news) {
                            if (scope.code) {
                                scope.news = _.filter(news, function (n) {
                                    return n.course === scope.code;
                                });
                            }
                            else {
                                scope.news = news;
                            }
                            scope.fetched = true;
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }
            };
}]);
