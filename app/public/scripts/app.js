'use strict';

angular.module('hapi-learning', [
        'ui.router',
        'ngTagsInput',
        'jcs-autoValidate',
        'ngFileUpload',
        'angularFileUpload',
        'angular-loading-bar',
        'ui.ace',
        'ui.validate',
        'restangular',
        'angular-storage',
        'angular-jwt'])
    .config(['$urlRouterProvider', '$stateProvider',
                function ($urlRouterProvider, $stateProvider) {
            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('root', {
                    templateUrl: '/views/root.html'
                })
                .state('root.home', {
                    url: '/',
                    templateUrl: '/views/home.html',
                    controller: 'HomeCtrl'
                })
                .state('root.courses', {
                    url: '/courses',
                    templateUrl: '/views/courses.html',
                    controller: 'CoursesCtrl'
                })
                .state('root.admin', {
                    url: '/admin',
                    templateUrl: '/views/admin.html',
                    controller: 'AdminCtrl'
                })
                .state('root.profile', {
                    url: '/profile',
                    templateUrl: '/views/profile.html',
                    controller: 'ProfileCtrl'
                })
                .state('root.news', {
                    url: '/news',
                    templateUrl: '/views/news.html',
                    controller: 'NewsCtrl'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: '/views/login.html',
                    controller: 'LoginCtrl'
                })
    }])
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }])

    .constant('API', 'http://localhost:8088')
    .config(['RestangularProvider', 'API', function (RestangularProvider, API) {
        RestangularProvider.setBaseUrl(API);
    }])

    .config(['storeProvider', function(storeProvider) {
        storeProvider.setStore('localStorage');
    }])

     .config(['$httpProvider', 'jwtInterceptorProvider',
              function($httpProvider, jwtInterceptorProvider) {
        jwtInterceptorProvider.tokenGetter = ['store', function(store) {
            return store.get('token');
        }];

        $httpProvider.interceptors.push('jwtInterceptor');
      });

    .run(['bootstrap3ElementModifier', function (bootstrap3ElementModifier) {
        bootstrap3ElementModifier.enableValidationStateIcons(true);
    }])

    .run(['defaultErrorMessageResolver', function (defaultErrorMessageResolver) {
            // passing a culture into getErrorMessages('fr-fr') will get the culture specific messages
            // otherwise the current default culture is returned.
            defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
                errorMessages['passwordMatch'] = 'Passwords do not match!';
            });
    }
]);
