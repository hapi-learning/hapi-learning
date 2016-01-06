'use strict';

angular.module('hapi-learning')
    .directive('courseList', [
    'CoursesFactory', 'TagsFactory', function (CoursesFactory, TagsFactory) {
        return {
            restrict: 'E',
            scope: {
                courses: '='
            },
            templateUrl: 'components/course-list/course-list.html'
        };
    }]);
