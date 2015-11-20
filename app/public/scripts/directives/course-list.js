angular.module('hapi-learning')
    .directive('courseList', function () {
        return {
            restrict: 'E',
            scope: {
                courses: '='
            },
            templateUrl: 'scripts/directives/course-list.html',
            link: function(scope, elem, attrs) {
              //  scope.courses = scope.$eval(attrs.courses);
                //console.log('courses-list', scope.courses);
            }
        };
    });
