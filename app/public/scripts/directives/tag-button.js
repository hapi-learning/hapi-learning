'use strict';

angular.module('hapi-learning')
    .directive('tagButton', function () {
        return {
            restrict: 'E',
            scope: {
                tag: '='
            },
            templateUrl: 'scripts/directives/tag-button.html'
        };
    });
