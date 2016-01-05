'use strict';

angular.module('hapi-learning')
    .directive('updated', [function () {
        return {
            restrict: 'E',
            scope : {
                code : '='
            },
            templateUrl: 'components/updated/updated.html',
            link: function (scope, elem, attrs) {

                scope.updated = false;
                scope.available = false;

                scope.$watch('code', function(value) {
                    if (value) {
                    // TO-DO
                    scope.updated = true;
                    scope.available = true;
                    }
                });

            }
        };
    }]);
