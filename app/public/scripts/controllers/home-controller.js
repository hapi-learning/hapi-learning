'use strict';

angular
    .module('hapi-learning')
    .controller('HomeCtrl', [
        '$scope', 'CoursesFactory',
        function ($scope, CoursesFactory) {

            CoursesFactory.getSubscribed()
                .then(function(courses) {
                    if (courses) {
                        $scope.courses = courses;
                    }
            })
            .catch(function(error) {
                console.log(error);
            });

}]);
