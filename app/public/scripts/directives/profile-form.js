'use strict';

angular.module('hapi-learning')
    .directive('profileForm', ['LoginFactory', 'ProfileFactory', '$rootScope',
                             function(LoginFactory, ProfileFactory, $rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'scripts/directives/profile-form.html',
        link: function(scope, elem, attrs) {

            scope.passwords = {};

            scope.removeErrors = function() {
                // Remove errors ..
            };



            var validateEmail = function(email) {
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                return re.test(email);
            };

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

                if (data.email !== scope.profile.email) {
                    if (!validateEmail(data.email)) {
                        var message = 'Invalid email';
                        scope.profileForm.$setError('email', message);
                        return message;
                    } else {
                        profile.email = data.email;
                    }
                }

                if (typeof data.newPassword !== 'undefined') {
                    if (data.newPassword === data.confirmPassword) {
                        profile.password = data.newPassword;
                    } else {
                        var message = 'Passwords do not match';
                        scope.profileForm.$setError('newPassword', message);
                        scope.profileForm.$setError('confirmPassword', message);
                        return message;
                    }
                }


                return ProfileFactory.update(profile).then(function() {
                    scope.removeErrors();
                });
            };

        }
    };
}]);
