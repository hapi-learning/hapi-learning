'use strict';

angular.module('hapi-learning.um')
    .directive('loginForm', ['$rootScope', '$state', '$stateParams', 'LoginFactory', 'UM_CONFIG',
                function($rootScope, $state, $stateParams, LoginFactory, UM_CONFIG) {
    return {
        restrict: 'A',
        templateUrl: 'submodules/user-management/templates/login-form.html',
        link: function(scope, elem, attrs) {

            $rootScope.titlePage = 'Login';

            scope.user = {};
            scope.invalidCredentials = false;

            scope.login = function() {
                console.log('Logging in ...');
                LoginFactory
                    .login(scope.user)
                    .then(function() {
                        $state.go(UM_CONFIG.AFTER_LOGIN_STATE);
                    })
                    .catch(function() {
                        scope.invalidCredentials = true;
                    });
                };
        }
    };
}]);
