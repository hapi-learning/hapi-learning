angular.module('hapi-learning.um', [
        'angular-jwt',
        'angular-storage'
    ])
    .constant('LOGIN_UM_CONFIG', {
        API_PREFIX: '',
        API_LOGIN_ENDPOINT: '/login',
        API_LOGOUT_ENDPOINT: '/logout',
        API_ME_ENDPOINT: '/me',
        LOGIN_STATE: 'login',
        AFTER_LOGIN_STATE: 'root.home'
    })
    .factory('AuthStorage', ['store', function (store) {
            return store.getNamespacedStore('auth');
    }])
    .factory('LoginFactory', ['$state', '$http', 'jwtHelper',
                              'AuthStorage', '$q', 'UM_CONFIG',
                              function ($state, $http, jwtHelper,
                                             AuthStorage, $q, UM_CONFIG) {

        var exports = {};
        var internals = {};

        internals.loadProfile = function() {
            return $q(function(resolve, reject) {
                $http({
                    url: UM_CONFIG.API_PREFIX + UM_CONFIG.API_ME_ENDPOINT,
                    method: 'GET',
                })
                .$promise
                .then(function success(response) {
                    var user = response.data;
                    resolve(user);
                })
                .catch(function failure(error) {
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
                if (!internals.profile) {
                    internals.loadProfile().then(function(profile) {
                        internals.profile = profile;
                        resolve(internals.profile);
                    });
                } else {
                    resolve(internals.profile);
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
                .$promise
                .then(function(response) {
                    internals.loadProfile().then(resolve).catch(reject);
                })
                .catch(function(error) {
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
                .$promise
                .then(function (response) {
                    AuthStorage.remove('token');
                    delete internals.profile;
                    $state.go(UM_CONFIG.LOGIN_STATE);
                    resolve();
                }).catch(function (response) {
                    reject(response);
                });
            });
        };

        return exports;
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
        function(LoginFactory, $location, $rootScope) {
            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams) {
                    if (toState.name === UM_CONFIG.LOGIN_STATE && LoginFactory.isConnected()) {
                            $state.go(UM_CONFIG.AFTER_LOGIN_STATE);
                    } else {
                        if (!LoginFactory.isConnected()) {
                            $state.go(UM_CONFIG.LOGIN_STATE);
                        }
                    }
            })
        }
    ]);
