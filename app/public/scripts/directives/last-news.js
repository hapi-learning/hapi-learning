'use strict';

angular.module('hapi-learning')
    .directive('lastNews', [
    'NewsFactory',
    '$rootScope',
    '$timeout',
    function (NewsFactory, $rootScope, $timeout) {
            return {
                restrict: 'E',
                scope: {
                    count: '=',
                    code: '='
                },
                templateUrl: 'templates/last-news.html',
                link: function (scope, element, attrs) {

                    scope.news = [];

                    const internals = {
                        options: {
                            page: 1
                        }
                    };

                    internals.options.limit = scope.count ? scope.count : 5;

                    scope.scrollDisabled = function() {

                        var predicate = (typeof scope.count !== 'undefined');
                        if (internals.pageCount) {
                            predicate = predicate || (internals.options.page > internals.pageCount);
                        }

                        return predicate;
                    };

                    scope.getNews = function(reset) {
                        if (scope.code) {
                            internals.options.code = scope.code;
                        }

                        NewsFactory.get(internals.options).then(function(response) {
                            if (reset) {
                                scope.news = [].concat(response.results);
                            } else {
                                scope.news = scope.news.concat(response.results);
                            }

                            internals.totalCount = response.meta.totalCount;
                            internals.pageCount = response.meta.pageCount;
                            internals.options.page++;
                        });
                    };

                    if (scope.count) {
                        $timeout(scope.getNews(false));
                    }

                    $rootScope.$on('unsubscribe', function() {
                        if (!scope.code) {
                            internals.options.page = 1;
                            internals.totalCount = null;
                            internals.pageCount = null;
                            scope.getNews(true);
                        }
                    });

                }
            };
}]);
