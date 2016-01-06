angular.module('hapi-learning')
    .controller('ProfileFormCtrl', ['$rootScope', '$scope', 'ProfileFactory',
                function ($rootScope, $scope, ProfileFactory) {

        var internals = {};

        $rootScope.titlePage = 'Profile';

        $scope.profile = $rootScope.$user;

        internals.profile = {
            passwords: {},
            notify: $scope.profile.notify
        };

        $scope.newProfile = angular.copy(internals.profile);

        internals.errors = $scope.errors = {
            invalidEmail: false,
            passwordsNotMaching: false,
            passwordMinLength: false
        };

        $scope.resetErrors = function () {
            $scope.errors = angular.copy(internals.errors);
        };

        $scope.cancel = function() {

            // Reset profile
            $scope.newProfile = angular.copy(internals.profile);

            $scope.resetErrors();
            $scope.profile = angular.copy($rootScope.$user);
        };

        var validateEmail = function (email) {

            var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return regex.test(email);
        };

        $scope.checkEmail = function (email) {

            if (!$scope.errors.invalidEmail) {
                return;
            }

            if (validateEmail(email)) {
                $scope.errors.invalidEmail = false;
            }
        }


        $scope.save = function() {

            $scope.resetErrors();

            var profile = {};

            var p = $scope.profile;
            var np = $scope.newProfile;

            if (np.firstName && np.firstName !== p.firstName) {
                profile.firstName = np.firstName;
            }

            if (np.lastName && np.lastName !== p.lastName) {
                profile.lastName = np.lastName;
            }

            if (np.phoneNumber && np.phoneNumber !== p.phoneNumber) {
                profile.phoneNumber = np.phoneNumber;
            }

            if (np.notify !== p.notify) {
                profile.notify = np.notify;
            }

            if (np.email && np.email !== p.email) {
                if (!validateEmail(np.email)) {
                    $scope.errors.invalidEmail = true;
                    return;
                } else {
                    profile.email = np.email;
                }
            }

            var newP = np.passwords.new;
            var confirmP = np.passwords.confirm;

            if ((newP || confirmP) || newP && confirmP) {

                var error = false;

                if (newP !== confirmP) {
                    $scope.errors.passwordsNotMaching = true;
                    error = true;
                }

                if (newP.length < 3) {
                    $scope.errors.passwordMinLength = true;
                    error = true;
                }

                if (error) {
                    return;
                }

                profile.password = newP;
            }

            return ProfileFactory.update(profile).then(function() {

                return ProfileFactory.get();
            }).then(function(profile) {
                $rootScope.$user = profile;
                $scope.cancel(); // Reset data
            })

        };

    }]);
