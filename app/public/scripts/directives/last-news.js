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
                    code: '='
                },
                templateUrl: 'scripts/directives/last-news.html',
                link: function (scope, element, attrs) {
                    scope.news = [];
                    scope.fetched = false;

                    // Si les dernières news sont spécifiques à un cours, il n'y a pas de nombre
                    NewsFactory.load(scope.code ? null : scope.count)
                        .then(function (news) {
                            if (scope.code) {
                                scope.news = _.filter(news, function (n) {
                                    return n.course === scope.code;
                                });
                                // specific course news are a sub array of all news
                                // so there is no data binding; a signal must be send if a news is added
                                $rootScope.$on('news_added', function (event, news) {
                                    if (!scope.code || news.code === scope.code) {
                                        var tmp = [news].concat(scope.news);
                                        scope.news = tmp;
                                    }
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
