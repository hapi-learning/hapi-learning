'use strict';

angular.module('hapi-learning.um', [
        'angular-jwt',
        'angular-storage',
        'ui.bootstrap'
    ])
    .constant('UM_CONFIG', {
        API_PREFIX: '',
        API_LOGIN_ENDPOINT: '/login',
        API_LOGOUT_ENDPOINT: '/logout',
        API_ME_ENDPOINT: '/me',
        LOGIN_STATE: 'login',
        AFTER_LOGIN_STATE: 'root.home',
        BEGIN_SESSION_EVENT: 'um.begin-session',
        END_SESSION_EVENT: 'um.end-session'
    })
    .factory('AuthStorage', ['store', function (store) {
            return store.getNamespacedStore('auth');
    }])
    .factory('LoginFactory', ['$state', '$http', 'jwtHelper',
                              'AuthStorage', '$q', 'UM_CONFIG', '$rootScope',
                              function ($state, $http, jwtHelper,
                                        AuthStorage, $q, UM_CONFIG, $rootScope) {

        var exports = {};
        var internals = {};

        internals.loadProfile = function() {
            return $q(function(resolve, reject) {
                $http({
                    url: UM_CONFIG.API_PREFIX + UM_CONFIG.API_ME_ENDPOINT,
                    method: 'GET',
                })
                .then(function success(response) {
                    var user = response.data;
                    resolve(user);
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
                        $rootScope.$emit(UM_CONFIG.BEGIN_SESSION_EVENT);
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
                    url: UM_CONFIG.API_PREFIX + UM_CONFIG.API_LOGIN_ENDPOINT,
                    skipAuthorization: true,
                    method: 'POST',
                    data: {
                        username: user.name, // TODO
                        password: user.password
                    }
                })
                .then(function(response) {
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
                    url: UM_CONFIG.API_PREFIX +  UM_CONFIG.API_LOGOUT_ENDPOINT,
                    method: 'POST'
                })
                .then(function (response) {
                    AuthStorage.remove('token');
                    delete $rootScope.$user;
                    $rootScope.$emit(UM_CONFIG.END_SESSION_EVENT);
                    $state.go(UM_CONFIG.LOGIN_STATE);
                    resolve();
                }, function (response) {
                    reject(response);
                });
            });
        };

        return exports;
    }])
    .factory('unauthorizedInterceptor', ['$injector', '$q', 'UM_CONFIG',
                                         function($injector, $q, UM_CONFIG) {
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
                    $state.go(UM_CONFIG.LOGIN_STATE);

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
    .config(['$httpProvider', function($httpProvider) {
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
    .run(['LoginFactory', '$state', 'UM_CONFIG', '$rootScope',
        function(LoginFactory, $state, UM_CONFIG, $rootScope) {
            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams) {
                    // Redirects to the after login state when connected
                    if (toState.name === UM_CONFIG.LOGIN_STATE && LoginFactory.isConnected()) {
                        event.preventDefault();
                        $state.go(fromState.name, fromParams);
                    // Redirects to the login state when not connected
                    } else if (toState.name !== UM_CONFIG.LOGIN_STATE && !LoginFactory.isConnected()) {
                        event.preventDefault();

                        $rootScope.$previous = {
                            $state: toState,
                            $stateParams: toParams
                        };


                        $state.go(UM_CONFIG.LOGIN_STATE)
                    }
            });
        }
    ]);




