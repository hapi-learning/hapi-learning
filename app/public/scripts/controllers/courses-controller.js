angular.module('hapi-learning')
    .controller('courses-controller', ['$scope', 'Restangular', function ($scope, Restangular) {

        $scope.courses = [];
        $scope.tags = [];
        $scope.selectedTags = [];


        Restangular.all('courses').getList().then(function (courses) {
            courses.forEach(course => {
                $scope.courses.push(course);
            });
        });
        
        Restangular.all('tags').getList().then(function (tags) {
            tags.forEach(tag => {
                console.log(tag);
                $scope.tags.push(tag);
            });
        });
        
        $scope.selected = function() {
            console.log('selected');  
        };


        console.log($scope.courses);

        $scope.subscribed = function () {
            // did the user already subscribe to the course?
            return false;
        };

        $scope.updated = function () {
            // course updated since user last connection?
            return true;
        };


//        $scope.selectedTags = ['Q4', 'labo'];

        $scope.filterByTags = function (course) {
            var select = true;

            $scope.selectedTags.forEach(function (tag) {
                select = select && (course.tags.indexOf(tag) !== -1);
            });

            return select;
        };

    }]);