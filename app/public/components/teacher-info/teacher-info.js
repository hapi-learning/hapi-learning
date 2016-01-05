'use strict';

angular.module('hapi-learning')
    .directive('teacherInfo', function () {
        return {
            restrict: 'EAC',
            templateUrl: 'components/teacher-info/teacher-info.html',
            scope: {
                teacher: '='
            }
        };
    });
