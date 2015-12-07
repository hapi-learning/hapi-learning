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
                            ngDialog.open({ template: 'templateId', scope: scope });
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }

            }
        };
    }]);