angular.module('hapi-learning')
    .controller('courses-controller', ['$scope', 'Restangular', function ($scope, Restangular) {

        //        $scope.courses = courses_factory.getCourses();

        $scope.courses = [];

        
        Restangular.all('courses').getList().then(function(courses) {
            courses.forEach(course => $scope.courses.push(course));
        });


        console.log($scope.courses);

        $scope.subscribed = function () {
            // did the user already subscribe to the course?
            return false;
        };

        $scope.updated = function () {
            // course updated since user last connection?
            return true;
        };

    }]);