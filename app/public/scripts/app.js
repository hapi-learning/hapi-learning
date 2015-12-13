'use strict';

angular.module('hapi-learning', [
        'hapi-learning.api',
        'hapi-learning.um',
        'ui.bootstrap',
        'ui.router',
        'ngTagsInput',
        'ngFileUpload',
        'angularFileUpload',
        'angular-loading-bar',
        'ui.ace',
        'ui.validate',
        'restangular',
        'angular-storage',
        'angular-jwt',
        'angularMoment',
        'angular.filter',
        'xeditable',
        'ng-showdown',
        'ngPrettyJson',
        'ngDialog',
        'pascalprecht.translate'])

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
                .state('login', {
                    url: '/login',
                    templateUrl: '/views/login.html'
                })
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
                    abstract: true,
                    templateUrl: '/views/admin.html',
                    controller: 'AdminCtrl'
                })
                .state('root.admin.courses', {
                    url: '/courses',
                    templateUrl: '/views/admin-courses.html'
                })
                .state('root.admin.users', {
                    url: '/users',
                    templateUrl: '/views/admin-users.html'
                })
                .state('root.admin.tags', {
                    url: '/tags',
                    templateUrl: '/views/admin-tags.html'
                })
                .state('root.admin.news', {
                    url: '/news',
                    templateUrl: '/views/admin-news.html'
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
                    templateUrl: '/views/course-documents.html',
                    params: {
                        showHidden: false
                    }
                })
                .state('root.course.news', {
                    url: '/news',
                    templateUrl: '/views/course-news.html'
                })
                .state('root.course.admin', {
                    url: '/admin',
                    templateUrl: '/views/course-admin.html'
                });
    }])
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }])

    .config(['storeProvider', function(storeProvider) {
        storeProvider.setStore('localStorage');
    }])
    
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: '../translations/locale-',
            suffix: '.json'
        });
 
        $translateProvider.preferredLanguage('fr_BE');
    }])

    .run(['Restangular', 'API', 'UM_CONFIG', 'AuthStorage', '$rootScope', 'LoginFactory',
          function (Restangular, API, UM_CONFIG, AuthStorage, $rootScope, LoginFactory) {
        API.then(function(response) {
            UM_CONFIG.API_PREFIX = response.data.api;
            Restangular.setBaseUrl(response.data.api);
            var token = AuthStorage.get('token');
            if (token && !$rootScope.$user) {
                LoginFactory.getProfile();
            }

        });

    }])
    .run(['editableOptions', 'editableThemes', function(editableOptions, editableThemes) {
        editableOptions.theme = 'bs3';
    }])
    .run(function(amMoment) {
        amMoment.changeLocale('en');
    });
