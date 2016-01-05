'use strict';

angular.module('hapi-learning')
    .directive('courseLink', function () {
        return {
            restrict: 'E',
            scope: {
                course : '='
            },
            templateUrl: 'components/course-link/course-link.html'
        };
    });
