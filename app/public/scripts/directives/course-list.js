'use strict';

angular.module('hapi-learning')
    .directive('courseList', ['CoursesFactory', function (CoursesFactory) {
        return {
            restrict: 'E',
            scope: {
                courses: '='
            },
            templateUrl: 'scripts/directives/course-list.html',
            link: function(scope, elem, attrs) {
                scope.courses = [];
                
                CoursesFactory.load()
                .then(function(courses) {
                    if (courses)
                    {
                        scope.courses = courses;
                    }
                })
                .catch(function(error) {console.log(error);});
            }
        };
    }]);
