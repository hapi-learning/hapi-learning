'use strict';

angular.module('hapi-learning')
    .directive('courseList', [
    'CoursesFactory', 'TagsFactory', function (CoursesFactory, TagsFactory) {
        return {
            restrict: 'E',
            scope: {
                subscribed: '=',
                filters: '='
            },
            templateUrl: 'scripts/directives/course-list.html',
            link: function(scope, elem, attrs) {
                                
                const internals = {
                    filterByTags : function (course) {
                        var select = true;
    
                        scope.selectedTags.forEach(function (tag) {
                            select = select && (course.tags.indexOf(tag.name) > -1);
                        });

                        return select;
                    }
                };
                
                scope.courses = [];
                scope.tags = [];
                scope.selectedTags = [];
                scope.courseFilter = {
                    filter : ''
                };

                scope.selected = function(tag) {

                    if (scope.selectedTags.indexOf(tag) > -1) {
                        _.remove(scope.selectedTags, {name: tag.name});
                    } else {
                        scope.selectedTags.push(tag);
                    }
                };
                
                scope.search = function (course) {
                    var name = angular.lowercase(course.name) || '';
                    var code = angular.lowercase(course.code) || '';
                    
                    return (
                        (_.includes(name, angular.lowercase(scope.courseFilter.filter)) || 
                        _.includes(code, angular.lowercase(scope.courseFilter.filter))) 
                        && internals.filterByTags(course)
                    );
                };

                /**
                    Listener on 'subscribe' scope value :
                    it loads all or part of courses.
                **/
                scope.$watch('subscribed', function(value) {

                    if (value === true)
                    {
                        CoursesFactory.getSubscribed()
                            .then(function(courses) {
                            if (courses)
                            {
                                scope.courses = courses;
                            }
                        })
                        .catch(function(error) {console.log(error);});
                    }
                    else if (value === false)
                    {
                        if (scope.filters) {
                            TagsFactory.load().then(function(tags) {
                                scope.tags = tags;
                            });
                        }

                        CoursesFactory.load()
                            .then(function(courses) {
                            if (courses)
                            {
                                scope.courses = courses;
                            }
                        })
                        .catch(function(error) {console.log(error);});
                    }
                });
            }
        };
    }]);
