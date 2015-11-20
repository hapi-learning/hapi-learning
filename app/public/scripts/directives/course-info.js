angular.module('hapi-learning')
    .directive('courseInfo', function () {
        return {
            restrict: 'E',
            scope: {
                course : '='
            },
            templateUrl: 'scripts/directives/course-info.html',
            link: function(scope, elem, attrs) {
                //console.log(attrs.course);
                //scope.course = scope.$eval(attrs.course);
            }
        };
    });
