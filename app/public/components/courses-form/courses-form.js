'use strict';

angular.module('hapi-learning')
    .directive('coursesForm', ['CoursesFactory', 'ngDialog', function (CoursesFactory, ngDialog) {
        return {
            restrict: 'E',
            templateUrl: 'components/courses-form/courses-form.html',
            link: function (scope, elem, attrs) {

                scope.validName = undefined;
                scope.validCode = undefined;

                scope.course = {
                    name: null,
                    code: null,
                    homepage: null,
                    teachers: [],
                    tags: []
                };

                scope.checkName = function($event) {

                    var names = CoursesFactory.loadNames()
                        .then(function (names) {
                            var pnames = _.map(names, function(name) { return name.name; });

                            scope.validName = !(pnames.indexOf(scope.course.name) !== -1);
                        });
                };

                scope.checkCode = function($event) {

                    var names = CoursesFactory.loadCodes()
                        .then(function (codes) {
                            var pcodes = _.map(codes, function(code) { return code.code; });

                            scope.validCode = !(pcodes.indexOf(scope.course.code) !== -1);
                        });
                };

                scope.postCourse = function () {
                    scope.course.homepage = scope.getContent();

                    return CoursesFactory.add(scope.course)
                        .then(function (course) {
                            console.log('Course added!');
                            ngDialog.open({ template: 'course-added', scope: scope });
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
