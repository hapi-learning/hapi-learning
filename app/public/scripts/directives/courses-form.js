'use strict';

angular.module('hapi-learning')
    .directive('coursesForm', ['CoursesFactory', 'ngDialog', function (CoursesFactory, ngDialog) {
        return {
            restrict: 'E',
            templateUrl: 'templates/courses-form.html',
            link: function (scope, elem, attrs) {

                scope.course = {
                    name: null,
                    code: null,
                    homepage: null,
                    teachers: [],
                    tags: []
                };

                scope.postCourse = function () {            
                    scope.course.homepage = scope.getContent();

                    return CoursesFactory.add(scope.course)
                        .then(function (course) {
                            console.log('Course added!');
                            ngDialog.open({ template: 'course-added', scope: scope });
                            scope.clearFields();
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }
                
                scope.clearFields = function () {
                    scope.course = {
                        name: null,
                        code: null,
                        homepage: null,
                        teachers: [],
                        tags: []
                    };
                };
                
                scope.complete = function () {
                    return scope.course.name && scope.course.code;
                };

            }
        };
    }]);