'use strict';

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const del = require('del');


const paths = {
    scripts: ['app/public/scripts/**/*.js', 'app/public/submodules/**/*.js'],
    styles: 'app/public/styles/**/*.css',
    index: 'app/public/index.html',
    partials: ['app/public/**/*.html', '!app/public/index.html',
               '!app/public/submodules/**/*.html',
               '!app/public/lib/**/*.html'],
    dist: 'app/dist',
    distScripts: 'app/dist/scripts',
    bowerConfig: {
        bowerDirectory : 'app/public/lib',
        bowerrc: 'app/public/.bowerrc',
        bowerJson: 'app/public/bower.json'
    }
};

const vendorScripts = [
        //lib scripts
        'app/public/lib/jquery/dist/jquery.min.js',
        'app/public/lib/bootstrap/dist/js/bootstrap.min.js',
        'app/public/lib/angular/angular.min.js',

        //angular modules
        'app/public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'app/public/lib/ng-tags-input/ng-tags-input.min.js',
        'app/public/lib/angular-auto-validate/dist/jcs-auto-validate.min.js',
        'app/public/lib/ng-file-upload/ng-file-upload.min.js',
        'app/public/lib/angular-file-upload/dist/angular-file-upload.min.js',
        'app/public/lib/angular-loading-bar/build/loading-bar.min.js',
        'app/public/lib/ace-builds/src-min-noconflict/ace.js',
        'app/public/lib/ace-builds/src-min-noconflict/ext-language_tools.js',
        'app/public/lib/ace-builds/src-min-noconflict/mode-markdown.js',
        'app/public/lib/ace-builds/src-min-noconflict/theme-twilight.js',
        'app/public/lib/angular-ui-ace/ui-ace.min.js',
        'app/public/lib/angular-ui-validate/dist/validate.min.js',
        'app/public/lib/lodash/lodash.min.js',
        'app/public/lib/restangular/dist/restangular.min.js',
        'app/public/lib/a0-angular-storage/dist/angular-storage.min.js',
        'app/public/lib/angular-jwt/dist/angular-jwt.min.js',
        'app/public/lib/moment/min/moment.min.js',
        'app/public/lib/angular-moment/angular-moment.min.js',
        'app/public/lib/angular-filter/dist/angular-filter.min.js',
        'app/public/lib/angular-xeditable/dist/js/xeditable.min.js',
        'app/public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'app/public/lib/angular-sanitize/angular-sanitize.min.js',
        'app/public/lib/showdown/dist/showdown.min.js',
        'app/public/lib/ng-showdown/dist/ng-showdown.min.js',
        'app/public/lib/ng-prettyjson/dist/ng-prettyjson.min.js',
];

const vendorCss = [
    'app/public/lib/bootstrap/dist/css/bootstrap.min.css',
    'app/public/lib/font-awesome/css/font-awesome.min.css',
    'app/public/lib/ng-tags-input/ng-tags-input.css',
    'app/public/lib/ng-tags-input/ng-tags-input.bootstrap.css',
    'app/public/lib/angular-loading-bar/build/loading-bar.min.css',
    'app/public/lib/angular-xeditable/dist/css/xeditable.css',
    'app/public/lib/ng-prettyjson/dist/ng-prettyjson.min.css'
];

const pipes = {};



pipes.orderedAppScripts = function() {
    return plugins.angularFilesort();
    /*return gulp.src(paths.scripts)
        .pipe(plugins.angularFilesort());*/
};

pipes.minifiedFileName = function() {
    return plugins.rename(function(path) {
        path.extname = '.min' + path.extname;
    });
};

pipes.validatedAppScripts = function() {
    return gulp.src(paths.scripts)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtAppScripts = function() {
    const validatedAppScripts = pipes.validatedAppScripts();

    return validatedAppScripts
        .pipe(pipes.orderedAppScripts())
        .pipe(plugins.concat('app.min.js'))
        .pipe(plugins.ngAnnotate())
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths.distScripts));
};

pipes.builtVendorScripts = function() {

    return gulp.src(vendorScripts)
            .pipe(plugins.concat('vendor.min.js'))
            .pipe(plugins.ngAnnotate())
            .pipe(plugins.uglify())
            .pipe(gulp.dest(paths.distScripts));
};


pipes.validatedPartials = function() {
    return gulp.src(paths.partials)
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter());
};

pipes.scriptedPartials = function() {
    return pipes.validatedPartials()
        .pipe(plugins.htmlhint.failReporter())
        .pipe(plugins.htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCss: true
        }))
        .pipe(gulp.dest(paths.dist));
};

pipes.builtVendorStyles = function() {
    return gulp.src(vendorCss)
        .pipe(plugins.concat('vendor.min.css'))
        .pipe(plugins.minifyCss())
        .pipe(gulp.dest(paths.dist));
};


pipes.builtStyles = function() {
    return gulp.src(paths.styles)
        .pipe(plugins.minifyCss())
        .pipe(pipes.minifiedFileName())
        .pipe(gulp.dest(paths.dist));
};

pipes.validatedIndex = function() {
    return gulp.src(paths.index)
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtSubmodules = function() {
    return gulp.src('app/public/submodules/**/*.html')
        .pipe(gulp.dest('app/dist/submodules'));
};

pipes.builtIndex = function() {

    const vendorScripts = pipes.builtVendorScripts();
    const appScripts = pipes.builtAppScripts();
    const appStyles = pipes.builtStyles();
    const vendorStyles = pipes.builtVendorStyles();
    pipes.builtSubmodules();
    pipes.scriptedPartials();


    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.dist))
        .pipe(plugins.inject(vendorScripts, {
            relative: true,
            name: 'bower'
        }))
        .pipe(plugins.inject(appScripts, {
            relative: true,
        }))
        .pipe(plugins.inject(vendorStyles, {relative: true, name: 'vendorcss'}))
        .pipe(plugins.inject(appStyles, { relative: true }))
        .pipe(plugins.htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCss: true
        }))
        .pipe(gulp.dest(paths.dist));
};

pipes.builtApp = function() {
    return pipes.builtIndex();
};

pipes.fontAwesome = function() {
    return gulp.src(paths.bowerConfig.bowerDirectory + '/font-awesome/fonts/**.*')
        .pipe(gulp.dest(paths.dist + '/fonts'));
};

pipes.bootstrapFonts = function() {
    return gulp.src(paths.bowerConfig.bowerDirectory + '/bootstrap/dist/fonts/**.*')
        .pipe(gulp.dest(paths.dist + '/fonts'));
};

gulp.task('font-awesome', pipes.fontAwesome);
gulp.task('font-bootstrap', pipes.bootstrapFonts);
gulp.task('fonts', ['font-awesome', 'font-bootstrap']);
gulp.task('clean-app', function() {
    del.sync(paths.dist);
});

gulp.task('validate-partials', pipes.validatedPartials);

gulp.task('clean-build-app', ['clean-app', 'fonts'], pipes.builtApp);

gulp.task('default', ['clean-build-app']);
