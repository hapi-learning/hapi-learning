'use strict';

angular.module('hapi-learning')
    .directive('news', [
    function () {
            return {
                restrict: 'E',
                scope : {
                    news : '='
                },
                templateUrl: 'scripts/directives/news.html'
            };
}]);
