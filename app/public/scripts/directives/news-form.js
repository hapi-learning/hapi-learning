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
                        console.log('SUBMIT');
                    };

                    CoursesFactory.load()
                        .then(function (courses) {
                            scope.codes = _.map(courses, 'code');
                            console.log(scope.codes);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }
            };
}]);
