angular.module('hapi-learning.login', [
        'angular-jwt',
        'angular-storage'
    ])
    .constant('LOGIN_CONFIG', {
        API_PREFIX: '',
        API_LOGIN_ENDPOINT: '/login',
        API_LOGOUT_ENDPOINT: '/logout',
        API_ME_ENDPOINT: '/me',
        LOGIN_STATE: 'login',
        AFTER_LOGIN_STATE: 'root.home'
    })
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
    .run(['LoginFactory', '$state', 'CONFIG', '$rootScope',
            function(LoginFactory, $location, $rootScope) {
                $rootScope.$on('$stateChangeStart',
                    function(event, toState, toParams, fromState, fromParams) {
                        if (toState.name === CONFIG.LOGIN_STATE && LoginFactory.getToken() !== null) {
                                $state.go(CONFIG.AFTER_LOGIN_STATE);
                        } else {
                            if (LoginFactory.getToken() === null) {
                                $state.go(CONFIG.LOGIN_STATE);
                            }
                        }
                })
            }])
