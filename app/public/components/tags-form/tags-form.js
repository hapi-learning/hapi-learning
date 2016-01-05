'use strict';

angular.module('hapi-learning')
    .directive('tagsForm', function() {
        return {
            restrict: 'E',
            templateUrl: 'components/tags-form/tags-form.html'

        };
    });
