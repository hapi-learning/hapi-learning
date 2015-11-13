angular.module('hapi-learning')
    .controller('courses-controller', ['$scope', 'Restangular', function ($scope, Restangular) {

        $scope.courses = [];
        $scope.tags = [];
        $scope.selectedTags = [];


        Restangular.all('courses').getList().then(function (courses) {
            for (var i = 0; i < courses.length; ++i) {
                $scope.courses.push(courses[i]);
            }
        });
        
        Restangular.all('tags').getList().then(function (tags) {
            for (var i = 0; i < tags.length; ++i) {
                $scope.tags.push(tags[i]);
            }
        });
        
        $scope.selected = function(tag) {
            console.log(tag.name + ' selected');
            
            if ($scope.selectedTags.indexOf(tag) > -1) {
                _.remove($scope.selectedTags, {name: tag.name});
            } else {
                $scope.selectedTags.push(tag);
            }
        };

        $scope.subscribed = function () {
            // did the user already subscribe to the course?
            return false;
        };

        $scope.updated = function () {
            // course updated since user last connection?
            return true;
        };

        $scope.filterByTags = function (course) {
            var select = true;

            $scope.selectedTags.forEach(function (tag) {
                select = select && (course.tags.indexOf(tag.name) > -1);
            });

            return select;
        };

    }]);