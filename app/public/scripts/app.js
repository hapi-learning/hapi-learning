'use strict';

angular.module('hapi-learning', [
        'hapi-learning.api',
        'hapi-learning.um',
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
        'angular-jwt',
        'ngLoadingSpinner'])

    .config(['$urlMatcherFactoryProvider', function($urlMatcherFactoryProvider) {
        $urlMatcherFactoryProvider.type('FilePath', {
            encode: function(value) {
                return value ? value.toString() : value;
            },
            decode: function(value) {
                return value ? value.toString() : value;
            },
            is: function(value) {
                return this.pattern.test(value);
            },
            pattern: /[^\0]+/
        });
    }])
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
                .state('root.course', {
                    templateUrl: '/views/course.html',
                    abstract: true,
                    url: '/courses/:code',
                    controller: 'CourseCtrl'
                })
                .state('root.course.main', {
                    url: '/home',
                    templateUrl: '/views/course-main.html'
                })
                .state('root.course.documents', {
                    url: '/documents{path:.*}',
                    templateUrl: '/views/course-documents.html'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: '/views/login.html'
                });
    }])
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }])



    .config(['storeProvider', function(storeProvider) {
        storeProvider.setStore('localStorage');
    }])


    .run(['bootstrap3ElementModifier', function (bootstrap3ElementModifier) {
        bootstrap3ElementModifier.enableValidationStateIcons(true);
    }])

    .run(['defaultErrorMessageResolver', function (defaultErrorMessageResolver) {
            // passing a culture into getErrorMessages('fr-fr') will get the culture specific messages
            // otherwise the current default culture is returned.
            defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
                errorMessages.passwordMatch = 'Passwords do not match!';
               // errorMessages['passwordMatch'] = 'Passwords do not match!';
            });
    }])
    .run(['Restangular', 'API', 'UM_CONFIG', function (Restangular, API, UM_CONFIG) {
        API.then(function(response) {
            UM_CONFIG.API_PREFIX = response.data.api;
            Restangular.setBaseUrl(response.data.api);
        });

    }]);
