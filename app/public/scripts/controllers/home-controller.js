'use strict';

angular
    .module('hapi-learning')
    .controller('HomeCtrl', [
        '$rootScope', '$scope', 'CoursesFactory',
        function ($rootScope, $scope, CoursesFactory) {

            $rootScope.titlePage = 'Home';

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
