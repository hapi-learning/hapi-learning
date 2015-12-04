'use strict';

angular.module('hapi-learning')
    .controller('CoursesCtrl', ['$scope', 'CoursesFactory', 'TagsFactory',
    function ($scope, CoursesFactory, TagsFactory) {

        var internals = {};
        internals.limit = 10;

        $scope.paginate = true;
        $scope.courses = [];
        $scope.tags = [];
        $scope.selectedTags = [];
        $scope.currentPage = 1;
        $scope.itemsPerPages = 10;
        $scope.coursesFilter = null;
        $scope.fetching = true;

        TagsFactory.load()
            .then(function(tags) {
                $scope.tags = tags;
            }).catch(function() {
                console.log('Error loading tags');
            });

        $scope.load = function() {

            var where = {};

            if ($scope.selectedTags.length > 0) {
                where.tags = $scope.selectedTags;
            } else {
                where.limit = internals.limit;
                where.page = $scope.currentPage;
            }

            if ($scope.coursesFilter) {
                where.codename = $scope.coursesFilter;
            }

            CoursesFactory.load(where)
                .then(function(res) {
                    if (Array.isArray(res)) {
                        $scope.courses = res;
                        $scope.paginate = false;
                    } else {
                        $scope.courses = res.results;
                        $scope.totalItems = res.meta.totalCount;
                        $scope.paginate = true;
                    }
                    $scope.fetching = false;
                });

        };

        $scope.selected = function(tag) {
            if (_.includes($scope.selectedTags, tag.name)) {
                _.remove($scope.selectedTags, function(t) {
                    return t === tag.name;
                });
            } else {
                $scope.selectedTags.push(tag.name);
            }

            $scope.load();
        };

        $scope.load();
    }]);
