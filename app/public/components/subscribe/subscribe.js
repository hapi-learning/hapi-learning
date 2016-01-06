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
                controller: function() {

                    var self = this;

                    self.fetching = true;
                    self.subscribed = false;

                    self.subscribe = function () {

                        CoursesFactory.subscribe(self.code).then(function (course) {

                            self.subscribed = true;
                            $rootScope.$emit('subscribe', course);
                        }).catch(function (error) {

                            // TODO - Do something
                            console.err(error);
                        });
                    };

                    self.unsubscribe = function () {

                        CoursesFactory.unsubscribe(self.code).then(function (course) {

                            self.subscribed = false;
                            $rootScope.$emit('unsubscribe', course);
                        }).catch(function (error) {

                            // TODO - Do something
                            console.err(error);
                        });
                    };


                    CoursesFactory.isSubscribed(self.code).then(function (subscribed) {

                        self.subscribed = subscribed;
                        self.fetching = false;
                    }).catch(function (error) {

                        console.err(error);
                    });
                },
                controllerAs: 'subscription'
            };
    }]);
