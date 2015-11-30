'use strict';

angular.module('hapi-learning')
    .directive('profileForm', ['LoginFactory', 'ProfileFactory',
                             function(LoginFactory, ProfileFactory) {
    return {
        restrict: 'E',
        templateUrl: 'scripts/directives/profile-form.html',
        link: function(scope, elem, attrs) {

            scope.updateProfile = function(data) {

                var profile = {};

                if (data.firstName !== scope.profile.firstName) {
                    profile.firstName = data.firstName;
                }

                if (data.lastName !== scope.profile.lastName) {
                    profile.lastName = data.lastName;
                }

                if (data.phoneNumber !== scope.profile.phoneNumber) {
                    profile.phoneNumber = data.phoneNumber;
                }

                if (typeof data.password !== 'undefined') {
                    if (typeof data.newPassword !== 'undefined' && data.newPassword === data.confirmPassword) {
                        profile.password = data.newPassword;
                    } else {
                        return 'Passwords do not match';
                    }
                }

                return ProfileFactory.update(profile);
            };

        }
    };
}]);
