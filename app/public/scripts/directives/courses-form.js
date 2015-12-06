'use strict';

angular.module('hapi-learning')
    .directive('coursesForm', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/courses-form.html'
        };
    });
