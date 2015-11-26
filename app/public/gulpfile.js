var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

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
        'lib/angular-ui-ace/ui-ace.min.js',
        'lib/angular-ui-validate/dist/validate.min.js',
        'lib/lodash/lodash.min.js',
        'lib/restangular/dist/restangular.min.js',
        'lib/a0-angular-storage/dist/angular-storage.min.js',
        'lib/angular-jwt/dist/angular-jwt.min.js',
        'lib/moment/moment.js',
        'lib/angular-moment/angular-moment.min.js',
        'lib/angular-filter/dist/angular-filter.min.js',
        'FileSaver.js',
        'lib/angular-xeditable/dist/js/xeditable.min.js',
        
        //app scripts
        'submodules/api/api.js',
        'submodules/user-management/scripts/um.js',
        'submodules/user-management/scripts/directives/login-form.js',
        
        'scripts/app.js',
        
        'scripts/**/*.js',
    ])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});
