'use strict';

angular.module('hapi-learning', [
        'ui.router', 'ngTagsInput', 'jcs-autoValidate', 'ngFileUpload', 'angularFileUpload', 'angular-loading-bar', 'ui.ace', 'ui.validate'])
    .config(['$urlRouterProvider', '$stateProvider',
                function ($urlRouterProvider, $stateProvider) {
            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('home', {
                    url: '/',
                    templateUrl: '/views/home.html',
                    controller: 'home-controller'
                })
                .state('courses', {
                    url: '/courses',
                    templateUrl: '/views/courses.html',
                    controller: 'courses-controller'
                })
                .state('admin', {
                    url: '/admin',
                    templateUrl: '/views/admin.html',
                    controller: 'admin-controller'
                })
                .state('profile', {
                    url: '/profile',
                    templateUrl: '/views/profile.html',
                    controller: 'profile-controller'
                })
                .state('news', {
                    url: '/news',
                    templateUrl: '/views/news.html',
                    controller: 'news-controller'
                })
        }])
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
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
    }
]);