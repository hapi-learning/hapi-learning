'use strict';

angular.module('hapi-learning')
    .directive('coursesForm', ['CoursesFactory', function (CoursesFactory) {
        return {
            restrict: 'E',
            templateUrl: 'templates/courses-form.html',
            link: function (scope, elem, attrs) {

                scope.course = {
                    name: null,
                    code: null,
                    homepage: null,
                    teachers: []
                };

                scope.postCourse = function () {            
                    scope.course.homepage = scope.getContent();

                    return CoursesFactory.add(scope.course)
                        .then(function (course) {
                            console.log('Course added!');
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }

            }
        };
    }]);