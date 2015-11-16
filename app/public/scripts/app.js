'use strict';

angular.module('hapi-learning', [
        'api-provider',
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
                .state('root.course', {
                    url: '/courses/:code',
                    templateUrl: '/views/course.html',
                    controller: 'CourseCtrl'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: '/views/login.html'
                })
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
                errorMessages['passwordMatch'] = 'Passwords do not match!';
            });
    }])
    .run(['Restangular', 'API',  function (Restangular, API) {
        API.then(function(response) {
            Restangular.setBaseUrl(response.data.api);
        });

    }]);
