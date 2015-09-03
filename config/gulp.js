import _ from 'underscore';
import gulp from 'gulp';
import gulpPlugin from 'gulp-load-plugins'
import filePathLintConfig from './filepath-lint';

var plugin = gulpPlugin({
  pattern: [ 'gulp-*', 'gulp.*', '@*/gulp{-,.}*' ],
  rename: {
    'gulp-lint-filepath': 'filepathlint'
  }
});


gulp.task('filepathlint', function() {
  return gulp.src(['./**/*.*', '!./node_modules/**/*'])
             .pipe(plugin.filepathlint(filePathLintConfig))
             .pipe(plugin.filepathlint.reporter())
             .pipe(plugin.filepathlint.reporter('fail'));
});

gulp.task('eslint', function() {
  return gulp.src('./src/**/*.js')
             .pipe(plugin.eslint({ configFile: './config/eslint.json' }))
              // Binding a function on data event is a workaround to gulp-eslint issue #36
             .pipe(plugin.eslint.format().on('data', _.noop));
});

// ---

gulp.task('lint', [ 'filepathlint', 'eslint' ]);
gulp.task('default', [ 'lint' ]);
