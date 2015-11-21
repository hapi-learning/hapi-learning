'use strict';

angular.module('hapi-learning')
    .directive('courseLink', function () {
        return {
            restrict: 'E',
            scope: {
                course : '='
            },
            templateUrl: 'scripts/directives/course-link.html'
        };
    });
