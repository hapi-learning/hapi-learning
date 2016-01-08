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

                    var internals = {};

                    var self = this;
                    self.fetching = true;
                    self.subscribed = false;
                    self.disabled = false;

                    internals.do = function(method) {

                        self.disabled = true;
                        CoursesFactory[method](self.code).then(function (course) {

                            self.subscribed = (method === 'subscribe');
                            $rootScope.$emit(method, course);
                        })
                        .catch(function (error) {

                            console.error(error);
                        })
                        .finally(function () {

                            $timeout(function () {

                                self.disabled = false;
                            }, 200);
                        });
                    };

                    self.subscribe = function () {

                        internals.do('subscribe');
                    };

                    self.unsubscribe = function () {

                        internals.do('unsubscribe');
                    };

                    CoursesFactory.isSubscribed(self.code).then(function (subscribed) {

                        self.subscribed = subscribed;
                        self.fetching = false;
                    })
                    .catch(function (error) {

                        console.error(error);
                    });
                }],
                controllerAs: 'subscription'
            };
    }]);
