angular.module('hapi-learning')
    .directive('mdEditor', function() {
        return {
            restrict: 'AE',
            templateUrl: 'scripts/directives/md-editor.html',
            scope: {
                content: '='
            },
            compile: function() {
                return {
                    pre: function(scope, elem, attrs) {

                        scope.writing = true;
                        scope.selectedFontSize = 16;
                        scope.fontSizes = [10, 15, 16, 18, 20, 25, 30, 35];

                        scope.aceLoaded = function(_editor) {
                            scope._editor   = _editor;
                            scope._session  = scope._editor.getSession();
                            scope._document = scope._session.getDocument();
                            _editor.setFontSize(scope.selectedFontSize);


                            scope.setContent(scope.content);
                        };

                        scope.setFontSize = function(v) {
                            scope.selectedFontSize = v;
                            if (scope._editor) {
                                scope._editor.setFontSize(scope.selectedFontSize);
                            }
                        }

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
                            if (content) {
                                scope._document.setValue(content);
                            }
                        };



                    }
                };
            }

        };
    });
