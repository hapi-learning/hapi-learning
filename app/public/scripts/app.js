'use strict';



angular.module('hapi-learning', [
        'hapi-learning.config',
        'hapi-learning.services',
        'hapi-learning.api',
        'hapi-learning.um',
        'ngMaterial',
        'ngLodash',
        'ui.bootstrap',
        'ui.router',
        'ui.gravatar',
        'ngTagsInput',  // Remove this, use chips instead
        'ngFileUpload',
        'angularFileUpload',
        'angular-loading-bar',
        'ui.ace',
        'ui.validate',
        'angular-storage',
        'angular-jwt',
        'angularMoment',
        'angular.filter',
        'xeditable',
        'ng-showdown',
        'ngPrettyJson',
        'ngDialog',
        'pascalprecht.translate',
        'infinite-scroll'])
    .config(['$mdThemingProvider', function($mdThemingProvider) {
        $mdThemingProvider.definePalette('palette-blue', $mdThemingProvider.extendPalette('blue', {
            '50': '#DCEFFF',
            '100': '#AAD1F9',
            '200': '#7BB8F5',
            '300': '#4C9EF1',
            '400': '#1C85ED',
            '500': '#106CC8',
            '600': '#0159A2',
            '700': '#025EE9',
            '800': '#014AB6',
            '900': '#013583',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 A100',
            'contrastStrongLightColors': '300 400 A200 A400'
          }));

          $mdThemingProvider.definePalette('palette-red', $mdThemingProvider.extendPalette('red', {
            '500': '#dd1523',
            'A100': '#650007'
          }));

          $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();

          $mdThemingProvider.theme('default')
                .primaryPalette('palette-blue')
                .warnPalette('palette-red')
                .accentPalette('purple');

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
                    templateUrl: '/views/profile.html'
                })
                .state('root.news', {
                    url: '/news',
                    templateUrl: '/views/news.html',
                    controller: 'NewsCtrl'
                })
                .state('root.course', {
                    templateUrl: '/views/course.html',
                    controller: 'CourseCtrl',
                    abstract: true,
                    url: '/courses/:code'
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
            prefix: '../locales/locale-',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escape');
    }])

    .run(['Rip', 'API', '$config', 'AuthStorage', '$rootScope', 'LoginFactory',
          function (Rip, API, $config, AuthStorage, $rootScope, LoginFactory) {

        API.then(function(response) {

            $config.$apiPrefix = response.data.api;
            Rip.setBaseUri(response.data.api);

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

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250)
