'use strict';

angular.module('hapi-learning')
    .directive('courseLink', function () {
        return {
            restrict: 'E',
            scope: {
                course : '='
            },
            templateUrl: 'templates/course-link.html'
        };
    });
