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
                        course : null,
                        subject : null,
                        content : null,
                        priority : null
                    };
                    scope.postNews = function () {
                        console.log(scope.news);
                    };
                    
                    scope.complete = function () {
                        /*return scope.news.course &&
                            scope.news.subject &&
                            scope.news.content &&
                            scope.news.priority;*/
                        return true;
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
