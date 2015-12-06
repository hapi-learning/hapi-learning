'use strict';

angular.module('hapi-learning')
    .directive('footer', function () {
        return {
            restrict: 'A',
            templateUrl: 'templates/footer.html'
        };
    });
