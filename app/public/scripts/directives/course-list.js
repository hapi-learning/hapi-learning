angular.module('hapi-learning')
    .directive('courseList', function () {
        return {
            restrict: 'E',
            templateUrl: 'scripts/directives/course-list.html',
            link: function(scope, elem, attrs) {
                scope.courses = scope.$eval(attrs.courses);
            }
        };
    });
