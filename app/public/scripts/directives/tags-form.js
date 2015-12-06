'use strict';

angular.module('hapi-learning')
    .directive('tagsForm', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/tags-form.html'

        };
    });
