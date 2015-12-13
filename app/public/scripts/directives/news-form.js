'use strict';

angular.module('hapi-learning')
    .directive('newsForm', [
    'CoursesFactory',
    'NewsFactory',
    'ngDialog',
    function (CoursesFactory, NewsFactory, ngDialog) {
            return {
                restrict: 'E',
                templateUrl: 'templates/news-form.html',
                scope: {
                    code: '='
                },
                link: function (scope, elem, attrs) {

                    scope.codes = [];
                    scope.news = {
                        course: null,
                        subject: null,
                        content: null,
                        priority: null
                    };

                    scope.priorities = [
                        'info', 'warning', 'danger'
                    ];

                    scope.postNews = function () {
                        if (scope.complete()) {
                            ngDialog.open({template: 'news-added', scope: scope });
                            scope.clearFields();
                        }
                    };

                    scope.clearFields = function () {
                        scope.news = {
                            course: null,
                            subject: null,
                            content: null,
                            priority: null
                        };
                    };

                    scope.complete = function () {
                        return ((scope.news.course || !scope.code) &&
                            scope.news.subject &&
                            scope.news.content &&
                            scope.news.priority);
                    };

                    if (scope.code) {
                        scope.codes = [scope.code];
                        scope.news.course = scope.code;
                        elem.find('#courseSelect').prop('disabled', true);
                    } else {
                        CoursesFactory.loadCodes()
                            .then(function (response) {
                                scope.codes = _.map(response, 'code');
                            }).catch(function (error) {
                                console.log(error);
                            });
                    }
                }
            };
    }]);
