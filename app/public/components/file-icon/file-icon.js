'use strict';

angular.module('hapi-learning')
    .directive('fileIcon', function() {

    return {
        restrict: 'A',
        scope: {
            ext: '='
        },
        templateUrl: 'components/file-icon/file-icon.html',
        link: function(scope, elem, attrs) {
            var fa = ''

            switch(scope.ext) {
                case '.pdf':
                    fa = 'file-pdf-o';
                    break;

                case '.txt':
                    fa = 'file-text-o';
                    break;

                case '.doc':
                case '.docx':
                    fa = 'file-word-o';
                    break;

                case '.xls':
                case '.xlsx':
                    fa = 'file-excel-o';
                    break;

                case '.ppt':
                case '.pptx':
                    fa = 'file-powerpoint-o';
                    break;

                case '.gif':
                case '.jpg':
                case '.jpeg':
                case '.png':
                case '.bmp':
                case '.tif':
                    fa = 'file-image-o';
                    break;

                case '.zip':
                case '.zipx':
                case '.rar':
                case '.tar':
                case '.gz':
                case '.dmg':
                case '.iso':
                    fa = 'file-archive-o';
                    break;

                // Add more if needed..
                case '.css':
                case '.js':
                case '.py':
                case '.cpp':
                case '.c':
                case '.cc':
                case '.java':
                case '.h':
                case '.hpp':
                case '.mm':
                case '.m':
                case '.coffee':
                case '.jade':
                case '.php':
                case '.cobol':
                case '.html':
                    fa = 'file-code-o';
                    break;

                case 'exe':
                case '.sh':
                case '.jar':
                case '.dll':
                case '.bat':
                case '.pl':
                case '.scr':
                case '.deb':
                case '.apk':
                case '.msi':
                case '.vb':
                    fa = 'file-cogs';
                    break;


                case '.wav':
                case '.mp3':
                case '.fla':
                case '.flac':
                case '.ra':
                case '.rma':
                case '.aif':
                case '.aiff':
                case '.aa':
                case '.aac':
                case '.aax':
                case '.ac3':
                case '.au':
                case '.ogg':
                case '.avr':
                case '.3ga':
                case '.mid':
                case '.midi':
                case '.m4a':
                case '.mp4a':
                case '.amz':
                case '.mka':
                case '.asx':
                case '.pcm':
                case '.m3u':
                case '.wma':
                case '.xwma':
                    fa = 'file-sound-o';
                    break;

                case '.avi':
                case '.mpg':
                case '.mp4':
                case '.mkv':
                case '.mov':
                case '.wmv':
                case '.webm':
                case '.h264':
                case '.flv':
                case '.gifv':
                case '.divx':
                case '.movie':
                case '.oggv':
                    fa = 'file-video-o';
                    break;

                default:
                    fa = 'file-o'
                    break;
            }

            scope.fa = 'fa fa-' + fa + ' fa-lg'
        }
    }

});
