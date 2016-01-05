'use strict';

angular.module('hapi-learning')
    .directive('courseList', [
    'CoursesFactory', 'TagsFactory', function (CoursesFactory, TagsFactory) {
        return {
            restrict: 'E',
            scope: {
                //subscribed: '=',
                //filters: '=',
                courses: '='
            },
            templateUrl: 'components/course-list/course-list.html',
            compile: function() {
                return {
                    pre: function(scope, elem, attrs) {

            /*            const internals = {
                            filterByTags : function (course) {
                                var select = true;

                                scope.selectedTags.forEach(function (tag) {
                                    select = select && (course.tags.indexOf(tag.name) > -1);
                                });

                                return select;
                            }
                        };
*/
                       //s scope.courses = [];
                      /*  scope.tags = [];
                        scope.selectedTags = [];
                        scope.courseFilter = {
                            filter : ''
                        };

                        scope.selected = function(tag) {

                            if (scope.selectedTags.indexOf(tag) > -1) {
                                _.remove(scope.selectedTags, {name: tag.name});
                            } else {
                                scope.selectedTags.push(tag);
                            }
                        };

                        scope.search = function (course) {
                            var name = angular.lowercase(course.name) || '';
                            var code = angular.lowercase(course.code) || '';

                            return (
                                (_.includes(name, angular.lowercase(scope.courseFilter.filter)) ||
                                _.includes(code, angular.lowercase(scope.courseFilter.filter)))
                                && internals.filterByTags(course)
                            );
                        };*/



                    }
                };
            }
        };
    }]);
