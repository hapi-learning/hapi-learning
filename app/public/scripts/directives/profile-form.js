'use strict';

angular.module('hapi-learning')
    .directive('profileForm', ['LoginFactory',
                             function(LoginFactory) {
    return {
        restrict: 'E',
        templateUrl: 'scripts/directives/profile-form.html',
        link: function(scope, elem, attrs) {




        }
    };
}]);
