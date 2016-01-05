'use strict';

angular.module('hapi-learning')
    .directive('newsLink', function () {
        return {
            restrict: 'E',
            scope: {
                news : '='
            },
            templateUrl: 'components/news-link/news-link.html'
        };
    });
