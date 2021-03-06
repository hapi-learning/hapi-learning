'use strict';

angular.module('hapi-learning.um', [
        'hapi-learning.config',
        'angular-jwt',
        'angular-storage',
        'ui.bootstrap'
    ])
    .factory('ProfileFactory', ['$http', '$config',
                                function($http, $config) {

        var exports = {};

        exports.update = function(profile) {

            return $http({
                method: 'PATCH',
                url: $config.uri($config.$apiMeEndpoint),
                data: JSON.stringify(profile)
            });
        };

        exports.get = function() {

            return $http({
                url: $config.uri($config.$apiMeEndpoint),
                method: 'GET',
            }).then(function(response) {
                return response.data;
            });
        }

        return exports;
    }])
    .factory('LoginFactory', ['$state', '$http', 'jwtHelper', 'ProfileFactory',
                              'AuthStorage', '$q', '$config', '$rootScope',
                              function ($state, $http, jwtHelper, ProfileFactory,
                                         AuthStorage, $q, $config, $rootScope) {

        var exports = {};
        var internals = {};

        internals.loadProfile = function() {

            return $q(function(resolve, reject) {
                ProfileFactory.get().then(function success(response) {
                    resolve(response);
                }, function failure(error) {
                    reject(error);
                });
            });

        };

        internals.getToken = function() {

            return AuthStorage.get('token');
        };

        exports.isConnected = function() {

            return internals.getToken() !== null;
        };

        exports.getProfile = function() {
            return $q(function(resolve, reject) {

                if (!$rootScope.$user) {
                    internals.loadProfile().then(function(profile) {

                        $rootScope.$user = profile;
                        $rootScope.$emit($config.$beginSessionEvent);
                        resolve($rootScope.$user);
                    }).catch(reject);
                } else {
                    resolve($rootScope.$user);
                }
            });
        };

        exports.login = function (user) {

            return $q(function(resolve, reject) {
                $http({
                    url: $config.uri($config.$apiLoginEndpoint),
                    skipAuthorization: true,
                    method: 'POST',
                    data: {
                        username: user.name, // TODO
                        password: user.password
                    }
                }).then(function(response) {

                    AuthStorage.set('token', response.data.token);
                    exports.getProfile().then(resolve);
                }, function(error) {
                    reject(error);
                });
            });
        };

        exports.logout = function () {
            return $q(function(resolve, reject) {

                $http({
                    url: $config.uri($config.$apiLogoutEndpoint),
                    method: 'POST'
                }).then(function (response) {

                    AuthStorage.remove('token');
                    delete $rootScope.$user;
                    $rootScope.$emit($config.$endSessionEvent);
                    $state.go($config.$loginState);
                    resolve();
                }, function (response) {
                    reject(response);
                });
            });
        };

        return exports;
    }])
    .factory('unauthorizedInterceptor', ['$injector', '$q', '$config',
                                         function($injector, $q, $config) {
        return {
            responseError: function(response) {

                var d = $q.defer();

                var $state = $injector.get('$state');
                var AuthStorage = $injector.get('AuthStorage');
                var token = AuthStorage.get('token');
                var jwtHelper = $injector.get('jwtHelper');
                var isExpired = (token && jwtHelper.isTokenExpired(token));

                if (response.status === 401 && isExpired) {

                    AuthStorage.remove('token');
                    $state.go($config.$loginState);

                    //var $uibModal = $injector.get('$uibModal');

                    /*$uibModal.open({
                        templateUrl: 'submodules/user-management/templates/login-form.html',
                        controller: ['$scope', '$uibModalInstance', 'LoginFactory',
                                     function($scope, $uibModalInstance, LoginFactory) {

                            $scope.user = {};
                            $scope.invalidCredentials = false;
                            $scope.login = function() {
                                LoginFactory
                                    .login($scope.user)
                                    .then(function() {
                                        $uibModalInstance.close();
                                        d.resolve(response);
                                    })
                                    .catch(function() {
                                        $scope.invalidCredentials = true;
                                    });
                            }
                        }]
                    })*/
                }

                d.reject(response);

                return d.promise;
            }
        }
    }])
    .config(['$httpProvider', function ($httpProvider) {

        $httpProvider.interceptors.push('unauthorizedInterceptor')
    }])
    .config(['$httpProvider', 'jwtInterceptorProvider',
          function($httpProvider, jwtInterceptorProvider) {

        jwtInterceptorProvider.tokenGetter = ['AuthStorage', function(AuthStorage) {

            return AuthStorage.get('token');
        }];

        $httpProvider.interceptors.push('jwtInterceptor');
    }])

    .run(['AuthStorage', 'jwtHelper', function(AuthStorage, jwtHelper) {
        // Removes an old token if expired
        var token = AuthStorage.get('token');
        if (token && jwtHelper.isTokenExpired(token)) {
            AuthStorage.remove('token');
        }
    }])
    .run(['LoginFactory', '$state', '$config', '$rootScope',
        function(LoginFactory, $state, $config, $rootScope) {

            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams) {

                    // Redirects to the after login state when connected
                    if (toState.name === $config.$loginState && LoginFactory.isConnected()) {
                        event.preventDefault();
                        $state.go(fromState.name, fromParams);
                    // Redirects to the login state when not connected
                    } else if (toState.name !== $config.$loginState && !LoginFactory.isConnected()) {
                        event.preventDefault();

                        $rootScope.$previous = {
                            $state: toState,
                            $stateParams: toParams
                        };

                        $state.go($config.$loginState)
                    }
            });
        }
    ]);




