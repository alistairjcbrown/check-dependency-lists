import _ from 'underscore';
import gulp from 'gulp';
import gulpPlugin from 'gulp-load-plugins'
import checkDependencyLists from '../';
import filePathLintConfig from './filepath-lint';

var plugin = gulpPlugin({
  pattern: [ 'gulp-*', 'gulp.*', '@*/gulp{-,.}*' ],
  rename: {
    'gulp-lint-filepath': 'filepathlint'
  }
});

gulp.task('dependency-lint', () => {
  return checkDependencyLists({
    rootDir: '../'
  });
});

gulp.task('file-path-lint', () => {
  return gulp.src(['./**/*.*', '!./node_modules/**/*'])
             .pipe(plugin.filepathlint(filePathLintConfig))
             .pipe(plugin.filepathlint.reporter())
             .pipe(plugin.filepathlint.reporter('fail'));
});

gulp.task('eslint', () => {
  return gulp.src('./src/**/*.js')
             .pipe(plugin.eslint({ configFile: './config/eslint.json' }))
              // Binding a function on data event is a workaround to gulp-eslint issue #36
             .pipe(plugin.eslint.format().on('data', _.noop));
});

// ---

gulp.task('lint', [ 'dependency-lint', 'file-path-lint', 'eslint' ]);
gulp.task('default', [ 'lint' ]);
