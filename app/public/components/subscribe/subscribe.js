'use strict';

angular.module('hapi-learning')
    .directive('subscribe', [
    'CoursesFactory',
    '$rootScope',
    function (CoursesFactory, $rootScope) {
            return {
                restrict: 'E',
                scope: true,
                bindToController: {
                    code: '='
                },
                templateUrl: 'components/subscribe/subscribe.html',
                controller: ['$timeout', function($timeout) {

                    var self = this;

                    self.fetching = true;
                    self.subscribed = false;
                    self.disabled = false;

                    self.subscribe = function () {

                        self.disabled = true;
                        CoursesFactory.subscribe(self.code).then(function (course) {

                            self.subscribed = true;
                            $rootScope.$emit('subscribe', course);
                        }).catch(function (error) {

                            // TODO - Do something
                            console.error(error);
                        }).finally(function () {

                            $timeout(function() {
                                self.disabled = false;
                            }, 200);
                        });
                    };

                    self.unsubscribe = function () {

                        self.disabled = true;
                        CoursesFactory.unsubscribe(self.code).then(function (course) {

                            self.subscribed = false;
                            $rootScope.$emit('unsubscribe', course);
                        }).catch(function (error) {

                            // TODO - Do something
                            console.error(error);
                        }).finally(function () {

                            $timeout(function() {
                                self.disabled = false;
                            }, 200);
                        });
                    };


                    CoursesFactory.isSubscribed(self.code).then(function (subscribed) {

                        self.subscribed = subscribed;
                        self.fetching = false;
                    }).catch(function (error) {

                        console.error(error);
                    });
                }],
                controllerAs: 'subscription'
            };
    }]);
