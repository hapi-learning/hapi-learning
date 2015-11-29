'use strict';

angular.module('hapi-learning')
    .directive('newsForm', [
    'LoginFactory',
    'CoursesFactory',
    function (LoginFactory, CoursesFactory) {
            return {
                restrict: 'E',
                templateUrl: 'scripts/directives/news-form.html',
                link: function (scope, elem, attrs) {

                    scope.codes = [];
                    scope.news = {
                        course: null,
                        subject: null,
                        content: null,
                        priority: null
                    };
                    scope.showPreview = false;
                    scope.postNews = function () {
                        if (scope.complete()) {
                            console.log(scope.news);
                        }
                    };

                    scope.complete = function () {
                        return scope.news.course &&
                            scope.news.subject &&
                            scope.news.content &&
                            scope.news.priority;
                    };
                    
                    scope.preview = function () {
                        scope.showPreview = !scope.showPreview;
                    };

                    CoursesFactory.load()
                        .then(function (courses) {
                            scope.codes = _.map(courses, 'code');
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }
            };
}]);
