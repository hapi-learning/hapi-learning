'use strict';

angular.module('hapi-learning')
    .directive('profileForm', ['LoginFactory', 'ProfileFactory', '$rootScope',
                             function(LoginFactory, ProfileFactory, $rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'components/profile-form/profile-form.html',
        controller: 'ProfileFormCtrl'
    };
}]);
