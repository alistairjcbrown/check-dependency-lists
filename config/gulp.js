import _ from 'underscore';
import gulp from 'gulp';
import gulpPlugin from 'gulp-load-plugins';
import runSequence from 'run-sequence';
import vinylPaths from 'vinyl-paths';
import del from 'del';
import filePathLintConfig from './filepath-lint';

const plugin = gulpPlugin({
  pattern: [ 'gulp-*', 'gulp.*', '@*/gulp{-,.}*' ],
  rename: {
    'gulp-lint-filepath': 'filepathlint'
  }
});

gulp.task('dependency-lint', () => {
  const checkDependencyLists = require('../');
  return checkDependencyLists();
});

gulp.task('file-path-lint', () => {
  return gulp.src([ './**/*.*', '!./node_modules/**/*' ])
             .pipe(plugin.filepathlint(filePathLintConfig))
             .pipe(plugin.filepathlint.reporter())
             .pipe(plugin.filepathlint.reporter('fail'));
});

gulp.task('eslint', () => {
  return gulp.src([ './**/*.js', '!./dist/**/*', '!./example/**/*' ])
             .pipe(plugin.eslint({ configFile: './config/eslint.json' }))
              // Binding a function on data event is a workaround to gulp-eslint issue #36
             .pipe(plugin.eslint.format().on('data', _.noop));
});

gulp.task('transpile', () => {
    return gulp.src('./src/**/*.js')
               .pipe(plugin.babel())
               .pipe(gulp.dest('./dist'));
});

gulp.task('mocha', () => {
  return gulp.src([ './test/**/*.test.js' ])
             .pipe(plugin.mocha({
                reporter: 'spec'
              }));
});

gulp.task('clean-dist', () => {
  return gulp.src([ './dist/**', '!./dist' ], { read: false })
             .pipe(vinylPaths(del));
});

// ---

gulp.task('lint', [ 'dependency-lint', 'file-path-lint', 'eslint' ]);

gulp.task('build', (callback) => {
  runSequence('clean-dist', 'transpile', callback);
});

gulp.task('test', [ 'mocha' ]);

gulp.task('default', (callback) => {
  runSequence('lint', 'build', 'test', callback);
});
