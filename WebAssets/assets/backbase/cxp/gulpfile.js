var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var del = require('del');
var rename = require('gulp-rename');
var insert = require('gulp-insert');
var util = require('util');
var path = require('path');
var buffer = require('vinyl-buffer');

var deps = [
    './node_modules/cxp-web-apis/configuration/dist/cxp-configuration.min.js',
    './node_modules/cxp-web-apis/render/dist/cxp-renderer.min.js',
    './node_modules/portal5-support/portal5-client-shim.js'
];

var depsRenameMap = {
    'portal5-client-shim' : 'portal-client-shim'
};

var PACKAGE_MESSAGE =
    '/**\n' +
    ' * %s - Copyright © %s Backbase B.V - All Rights Reserved\n' +
    ' * Version %s\n' +
    ' * %s\n' +
    ' */\n';

gulp.task('copy-dependencies', function() {
    return gulp.src(deps)
        .pipe(rename(function(path) {
            if(path.basename in depsRenameMap) {
                path.basename = depsRenameMap[path.basename];
            }
        })).pipe(gulp.dest('./js/shared'));
});

gulp.task('clean', function () {
    return del('./js/dist/**');
});

//package with browserify
gulp.task('package-android', [ 'clean' ], function() {

    var meta = require('./package.json');
    var year = new Date().getFullYear();
    var description = meta.description;
    var packageMessage = util.format(PACKAGE_MESSAGE, description, year, meta.version, meta.homepage);

    return browserify({
        entries: './js/android/android-render.js'
    }).ignore('sax')
        .ignore('xmldoc')
        .bundle()
        .pipe(source('android-render.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(insert.prepend(packageMessage))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./js/dist'));
});

gulp.task('package-ios', [ 'clean' ], function() {

    var meta = require('./package.json');
    var year = new Date().getFullYear();
    var description = meta.description;
    var packageMessage = util.format(PACKAGE_MESSAGE, description, year, meta.version, meta.homepage);

    return browserify({
        entries: './js/ios/ios-render.js'
    }).ignore('sax')
        .ignore('xmldoc')
        .bundle()
        .pipe(source('ios-render.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(insert.prepend(packageMessage))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./js/dist'));
});

// remove node_modules folder, it breaks the build
gulp.task('postbuild', ['package-android', 'package-ios'], function() {
    return del('./node_modules/**');
});

gulp.task('default', [ 'copy-dependencies', 'postbuild']);

