'use strict';

angular.module('hapi-learning')
    .directive('coursesForm', ['CoursesFactory', 'ngDialog', 'lodash', function (CoursesFactory, ngDialog, _) {
        return {
            restrict: 'E',
            templateUrl: 'components/courses-form/courses-form.html',
            controller: ['$scope', function($scope) {

                var self = this;

                self.validName = null;
                self.validCode = null;

                self.course = {
                    name: null,
                    code: null,
                    homepage: null,
                    teachers: [],
                    tags: []
                };

                self.checkName = function($event) {

                    var names = CoursesFactory.loadNames().then(function (names) {

                        var pnames = _.map(names, 'name');

                        self.validName = !(pnames.indexOf(self.course.name) !== -1);
                    });
                };

                self.checkCode = function($event) {

                    var names = CoursesFactory.loadCodes().then(function (codes) {

                        var pcodes = _.map(codes, 'code');
                        self.validCode = !(pcodes.indexOf(self.course.code) !== -1);
                    });
                };

                self.postCourse = function () {

                    self.course.homepage = $scope.getContent();

                    return CoursesFactory.add(self.course).then(function (course) {
                        ngDialog.open({
                            template: 'course-added',
                            scope: $scope,
                            preCloseCallback: self.clearFields
                        });
                    }).catch(function (error) {
                        console.err(error);
                    });
                }

                self.clearFields = function () {
                    self.course = {
                        name: null,
                        code: null,
                        homepage: null,
                        teachers: [],
                        tags: []
                    };

                    $scope.setContent('');
                };

                self.complete = function () {
                    return self.course.name && self.course.code;
                };
            }],
            controllerAs: 'form'
        };
    }]);
