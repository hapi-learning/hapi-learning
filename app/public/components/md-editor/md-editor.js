'use strict';

angular.module('hapi-learning')
    .directive('mdEditor', ['$rootScope', '$parse', function($rootScope, $parse) {
        return {
            restrict: 'AE',
            templateUrl: 'components/md-editor/md-editor.html',
            transclude: true,
            compile: function() {
                return {
                    pre: function(scope, elem, attrs) {

                        scope.content = scope.$eval(attrs.content);

                        scope.writing = true;
                        scope.selectedFontSize = 16;
                        scope.fontSizes = [10, 15, 16, 18, 20, 25, 30, 35];

                        scope.aceLoaded = function(_editor) {
                            scope._editor   = _editor;
                            scope._editor.focus();
                            scope._session  = scope._editor.getSession();
                            scope._document = scope._session.getDocument();

                            scope._editor.setFontSize(scope.selectedFontSize);
                            scope._editor.$blockScrolling = Infinity;
                            scope.setContent(scope.content);
                        };

                        scope.setFontSize = function(v) {
                            scope.selectedFontSize = v;
                            if (scope._editor) {
                                scope._editor.setFontSize(scope.selectedFontSize);
                            }
                        };

                        scope.options = {
                            onLoad: scope.aceLoaded,
                            mode: 'markdown'
                        };

                        scope.setEditor = function() {
                            scope.writing = true;
                        };

                        scope.setPreview = function() {
                            scope.writing = false;
                        };

                        scope.getContent = function() {
                            return scope._document.getValue();
                        };

                        scope.setContent = function(content) {
                            if (content !== null && typeof content !== 'undefined') {
                                scope._document.setValue(content);
                            }
                        };

                        scope.hasSave = function() {
                            return attrs.onsave;
                        };

                        scope.hasCancel = function() {
                            return attrs.oncancel;
                        };


                        scope.save = function() {
                            if (scope.hasSave()) {
                                return $parse(attrs.onsave)(scope, {$content: scope._document.getValue()});
                            }
                        };


                        scope.cancel = function() {
                            if (scope.hasCancel()) {
                                return $parse(attrs.oncancel)(scope);
                            }
                        };

                    }
                };
            }

        };
    }]);
