angular.module('hapi-learning')
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
    .run(['LoginFactory', '$location', '$rootScope',
            function(LoginFactory, $location, $rootScope) {
                $rootScope.$on('$stateChangeStart',
                    function(event, toState, toParams, fromState, fromParams) {
                        if (toState.name === 'login' && LoginFactory.getToken() !== null) {
                                $location.path('/');
                        } else {
                            if (LoginFactory.getToken() === null) {
                                $location.path('/login');
                            }
                        }
                })
            }])


