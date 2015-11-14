angular.module('hapi-learning')
        .config(['$httpProvider', 'jwtInterceptorProvider',
              function($httpProvider, jwtInterceptorProvider) {
            jwtInterceptorProvider.tokenGetter = ['AuthStorage', function(AuthStorage) {
                return AuthStorage.get('token');
            }];

            $httpProvider.interceptors.push('jwtInterceptor');
        }])

angular.module('hapi-learning')
    .run(['LoginFactory', '$location', '$rootScope',
            function(LoginFactory, $location, $rootScope) {
                $rootScope.$on('$stateChangeStart',
                    function(event, toState, toParams, fromState, fromParams) {
                        if (toState.name === 'login' && LoginFactory.getToken() !== null) {
                                $location.path('/');
                        } else {

                                $location.path('/login');
                        }
                })
            }]);
