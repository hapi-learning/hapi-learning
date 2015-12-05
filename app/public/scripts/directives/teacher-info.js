'use strict';

angular.module('hapi-learning')
    .directive('teacherInfo', function () {
        return {
            restrict: 'EAC',
            templateUrl: 'templates/teacher-info.html',
            scope: {
                teacher: '='
            }
        };
    });
