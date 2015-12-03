'use strict';

angular.module('hapi-learning')
    .directive('newsForm', [
    'LoginFactory',
    'CoursesFactory',
    'NewsFactory',
    function (LoginFactory, CoursesFactory, NewsFactory) {
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

                    scope.postNews = function () {
                        if (scope.complete()) {
                            NewsFactory.add(scope.news)
                            .then(function (news) {
                                alert('AJOUTÉÉ');
                            })
                            .catch(function (error) {console.log(error);});
                        }
                    };

                    scope.complete = function () {
                        return scope.news.course &&
                            scope.news.subject &&
                            scope.news.content &&
                            scope.news.priority;
                    };

                    CoursesFactory.loadCodes()
                        .then(function(response) {
                            scope.codes = _.map(response, 'code');
                        }).catch(function(error) {
                            console.log(error);
                        })

                }
            };
}]);
