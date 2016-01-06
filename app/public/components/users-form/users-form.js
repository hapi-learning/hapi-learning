'use strict';

angular.module('hapi-learning')
    .directive('usersForm', ['$translate', function ($translate) {
        return {
            restrict: 'E',
            templateUrl: 'components/users-form/users-form.html',
            link: function (scope, element) {

                $translate('FORM.USERS.IMPORT.BUTTONS.SELECT').then(function (button) {
                    element.find(':file').filestyle({
                        buttonName: "btn-primary",
                        buttonText: button,
                        badge: false,
                        input: false
                    });
                });

            }
        };
    }]);
