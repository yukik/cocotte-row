var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

gulp.task('build', function () {
  browserify('lib/row.js')
    .bundle()
    .pipe(source('row.min.js'))
    .pipe(buffer())
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(gulp.dest('public'));
});

gulp.task('watch', function() {
  gulp.watch('lib/**/*.js', ['build']);
});

gulp.task('default', ['build', 'watch']);