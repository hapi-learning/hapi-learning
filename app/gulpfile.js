var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');

// Concatenate & Minify JS
gulp.task('scripts', function() {
    
    return gulp.src([
        
        //lib scripts
        'lib/jquery/dist/jquery.min.js',
        'lib/bootstrap/dist/js/bootstrap.min.js',
        'lib/angular/angular.min.js',
        
        //angular modules
        'lib/angular-ui-router/release/angular-ui-router.min.js',
        'lib/ng-tags-input/ng-tags-input.min.js',
        'lib/angular-auto-validate/dist/jcs-auto-validate.min.js',
        'lib/ng-file-upload/ng-file-upload.min.js',
        'lib/angular-file-upload/dist/angular-file-upload.min.js',
        'lib/angular-loading-bar/build/loading-bar.min.js',
        'lib/ace-builds/src-min-noconflict/ace.js',
        'lib/ace-builds/src-min-noconflict/ext-language_tools.js',
        'lib/ace-builds/src-min-noconflict/mode-markdown.js',
        'lib/ace-builds/src-min-noconflict/theme-twilight.js',
        'lib/angular-ui-ace/ui-ace.min.js',
        'lib/angular-ui-validate/dist/validate.min.js',
        'lib/lodash/lodash.min.js',
        'lib/restangular/dist/restangular.min.js',
        'lib/a0-angular-storage/dist/angular-storage.min.js',
        'lib/angular-jwt/dist/angular-jwt.min.js',
        'lib/moment/min/moment.min.js',
        'lib/angular-moment/angular-moment.min.js',
        'lib/angular-filter/dist/angular-filter.min.js',
        'FileSaver.js',
        'lib/angular-xeditable/dist/js/xeditable.min.js',
        'lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'lib/angular-sanitize/angular-sanitize.min.js',
        'lib/showdown/dist/showdown.min.js',
        'lib/ng-showdown/dist/ng-showdown.min.js',
        'lib/ng-prettyjson/dist/ng-prettyjson.min.js',
        
        //app scripts
        'submodules/**/*.js',
        
        'scripts/app.js',
        
        'scripts/**/*.js'
    ])
        .pipe(concat('all.min.js'))
//        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'));
});

// /!\ HORS SERVICE
/*  
gulp.task('css', function() {
    
    return gulp.src([
        
        'lib/font-awesome/css/font-awesome.min.css',
        'lib/angular-loading-bar/build/loading-bar.min.css',
        'styles/main.css',
        'lib/angular-xeditable/dist/css/xeditable.css',
        'lib/ng-prettyjson/dist/ng-prettyjson.min.css'
    ])
        .pipe(concat('all.min.css'))
        .pipe(gulp.dest('dist/css'));
})
*/
