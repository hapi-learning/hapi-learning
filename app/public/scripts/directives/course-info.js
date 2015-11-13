angular.module('hapi-learning')
    .directive('courseInfo', function () {
        return {
            restrict: 'E',
            templateUrl: 'scripts/directives/course-info.html',
            link: function(scope, elem, attrs) {
                scope.course = scope.$eval(attrs.course);
            }
        };
    });
