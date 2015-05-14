var gulp = require('gulp')
    , browserify = require('browserify')
    , source = require('vinyl-source-stream')
    , buffer = require('vinyl-buffer')
    , watchify = require('watchify')
    , uglify = require('gulp-uglify')
    , jshint = require('gulp-jshint');

function browserifyCompile(){

    var bundleShare = function(b) {

        b.bundle()
            .pipe(source('../bundle.min.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest('./public/js/app/'));

        b.bundle()
            .pipe(source('../bundle.js'))
            .pipe(buffer())
            .pipe(gulp.dest('./public/js/app/'));

        console.log('Compiled ' + new Date() + ' ' + Math.round(Math.random() * 1000000));
    };

    var b = browserify({
        cache: {},
        packageCache: {},
        fullPaths: false
    });

    var w = watchify(b);

    w.on('update', function(){
        bundleShare(w);
    });

    // App entry point
    w.add('./public/js/app/exports.js');
    bundleShare(b);
}

gulp.task('browserify', function(){
    browserifyCompile();
});

gulp.task('jshint', function() {
    gulp.src('./public/js/app/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('default', ['jshint', 'browserify']);