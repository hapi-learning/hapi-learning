'use strict';

angular.module('hapi-learning', [
        'ui.router', 'ngTagsInput', 'jcs-autoValidate', 'ngFileUpload', 'angularFileUpload', 'angular-loading-bar'])
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
        }])
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
        }])
    .run(['bootstrap3ElementModifier', function (bootstrap3ElementModifier) {
            bootstrap3ElementModifier.enableValidationStateIcons(true);
        }]);