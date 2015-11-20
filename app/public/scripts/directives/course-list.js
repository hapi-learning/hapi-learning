angular.module('hapi-learning')
    .directive('courseList', function () {
        return {
            restrict: 'E',
            scope: {
                courses: '='
            },
            templateUrl: 'scripts/directives/course-list.html',
        };
    });
