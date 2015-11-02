'use strict';

angular.module('hapi-learning', [
        'ui.router'])
        .config(['$urlRouterProvider', '$stateProvider',
                function($urlRouterProvider, $stateProvider) {
                    $urlRouterProvider.otherwise('/');

                    $stateProvider
                        .state('home', {
                            url: '/',
                            templateUrl: '/views/home.html',
                            controller: 'home-controller'
                        })
                }]);