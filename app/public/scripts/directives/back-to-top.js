'use strict';

angular.module('hapi-learning')
    .directive('backToTop', function() {
        return {
            restrict: 'A',
            templateUrl: 'templates/back-to-top.html',
            link: function(scope, element, attrs) {
                angular.element(window).on('scroll', function() {
                    var elem = element.find('.back-to-top');
                    if (angular.element(this).scrollTop() > 650) {
                        elem.fadeIn(200);
                    } else {
                        elem.fadeOut(200);
                    }
                });

                element.on('click', function(event) {
                    event.preventDefault();
                    angular.element('html, body').animate({scrollTop: 0}, 300);
                    return false;
                });

            }
        };
    });
