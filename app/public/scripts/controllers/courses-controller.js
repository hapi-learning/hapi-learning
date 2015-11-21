'use strict';

angular.module('hapi-learning')
    .controller('CoursesCtrl',
                ['$scope', 'Restangular', 'CoursesFactory', 'TagsFactory',
                function ($scope, Restangular, CoursesFactory, TagsFactory) {

        $scope.courses = [];
        $scope.tags = [];
        $scope.selectedTags = [];


        CoursesFactory.load(50).then(function(courses) {
            $scope.courses = courses;
        }).catch(function(err) {
            console.log(err);
        });

        TagsFactory.load().then(function(tags) {
            $scope.tags = tags;
        });
                    
        $scope.selected = function(tag) {
            console.log(tag.name + ' selected');

            if ($scope.selectedTags.indexOf(tag) > -1) {
                _.remove($scope.selectedTags, {name: tag.name});
            } else {
                $scope.selectedTags.push(tag);
            }
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
