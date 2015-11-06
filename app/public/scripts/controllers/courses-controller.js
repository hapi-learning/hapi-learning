angular.module('hapi-learning')
    .controller('courses-controller', ['$scope', 'courses_factory', function ($scope, courses_factory) {

        $scope.courses = courses_factory.getCourses();

        $scope.subscribed = function () {
            // did the user already subscribe to the course?
            return false;
        };

        $scope.updated = function () {
            // course updated since user last connection?
            return true;
        };

    }]);