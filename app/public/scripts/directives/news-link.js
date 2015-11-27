'use strict';

angular.module('hapi-learning')
    .directive('newsLink', function () {
        return {
            restrict: 'E',
            scope: {
                news : '='
            },
            templateUrl: 'scripts/directives/news-link.html'
        };
    });
