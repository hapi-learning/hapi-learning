'use strict';

angular.module('hapi-learning')
    .directive('lastNews', [
    'NewsFactory',
    function (NewsFactory) {
            return {
                restrict: 'E',
                scope: {
                    count: '='
                },
                templateUrl: 'scripts/directives/last-news.html',
                link: function (scope, element, attrs) {
                    scope.news = [];
                    scope.fetched = false;

                    NewsFactory.load(typeof scope.count === 'number' ? scope.count : null)
                        .then(function (news) {
                        console.log(news);
                            scope.news = news;
                            scope.fetched = true;
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }
            };
}]);
