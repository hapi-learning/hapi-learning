'use strict';

angular.module('hapi-learning')
    .controller('CoursesCtrl', ['$scope', 'CoursesFactory', 'TagsFactory',
    function ($scope, CoursesFactory, TagsFactory) {

        $scope.courses = [];
        $scope.tags = [];
        $scope.selectedTags = [];
        $scope.currentPage = 1;
        $scope.itemsPerPages = 10;
        $scope.coursesFilter = null;

        TagsFactory.load()
            .then(function(tags) {
                $scope.tags = tags;
            }).catch(function() {
                console.log('Error loading tags');
            });

        $scope.loadPage = function(limit, page, withFilters) {
            console.log($scope.coursesFilter);
            CoursesFactory.load(limit, page)
                .then(function(res) {
                    $scope.courses = res.results;
                    $scope.totalItems = res.meta.totalCount;
                });

        };

        $scope.selected = function(tag) {

            if ($scope.selectedTags.indexOf(tag) > -1) {
                _.remove($scope.selectedTags, {name: tag.name});
            } else {
                $scope.selectedTags.push(tag);
            }

            console.log($scope.selectedTags);
        };

        $scope.loadPage(10, $scope.currentPage);
    }]);
