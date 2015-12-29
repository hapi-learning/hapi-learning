'use strict';

angular.module('hapi-learning')
    .controller('CoursesCtrl', ['$rootScope', '$scope', 'CoursesFactory', 'TagsFactory',
    function ($rootScope, $scope, CoursesFactory, TagsFactory) {

        $rootScope.titlePage = 'Courses';

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
        $scope.searchText = null;

        $scope.filterTags = function (query) {

            var lowercase = angular.lowercase(query);

            var filter = function (tag, query) {
                return angular.lowercase(tag).indexOf(query) === 0;
            };

            return _.filter($scope.tags, function(tag) {
                return filter(tag, lowercase);
            });
        };

        TagsFactory.load()
            .then(function(tags) {
                $scope.tags = _.map(tags, 'name');
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


        $scope.onTagChange = function() {
            console.log('tag-change');
            console.log($scope.selectedTags);
            $scope.load();
        };

        $scope.load();
    }]);
