'use strict';

angular.module('hapi-learning.um')
    .directive('loginForm', ['$rootScope', '$state', '$stateParams', 'LoginFactory', '$config',
                function($rootScope, $state, $stateParams, LoginFactory, $config) {
    return {
        restrict: 'A',
        templateUrl: 'submodules/user-management/templates/login-form.html',
        link: function(scope, elem, attrs) {

            $rootScope.titlePage = 'Login';

            scope.user = {};
            scope.invalidCredentials = false;

            scope.login = function() {
                LoginFactory
                    .login(scope.user)
                    .then(function() {
                        if ($rootScope.$previous) {
                            var previous = $rootScope.$previous;
                            delete $rootScope.$previous;
                            $state.go(previous.$state.name, previous.$stateParams);
                        } else {
                            $state.go($config.$afterLoginState);
                        }
                    })
                    .catch(function() {
                        scope.invalidCredentials = true;
                    });
                };
        }
    };
}]);
