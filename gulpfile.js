
var gulp = require('gulp');
var removeEmptyLines = require('gulp-remove-empty-lines');
var include = require('gulp-include');
var minify = require('gulp-minify');

gulp.task('scripts', function() {
  gulp.src([
      './dev/js/main-head.js',
      './dev/js/main-body.js'
    ])
    .pipe(include())
      .on('error', console.log)
    .pipe(removeEmptyLines())
    .pipe(gulp.dest('./public/js'));
});

gulp.task('copy-html', function() {
  gulp.src('./dev/**.html')
    .pipe(gulp.dest('./public'));
});

gulp.task('compress', function() {
  gulp.src('./dev/js/scripts/yo.js')
    .pipe(minify({
      ext:{
        src:'.js',
        min:'.min.js'
      },
      exclude: ['tasks'],
      ignoreFiles: ['.combo.js', '-min.js']
    }))
    .pipe(gulp.dest('./dev/'))
});

gulp.task('watch', function() {
  gulp.watch('./dev/js/**/**.js', ['default']); 
});

gulp.task('default', ['scripts', 'copy-html']);
