// REQUIRE PACKAGES
// For Gulp
const gulp = require('gulp');
const runSequence = require('run-sequence');
const watch = require('gulp-watch');
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');
const noop = require('gulp-noop');

// For Css
const sass = require('gulp-sass');

// For Js
const babel = require('gulp-babel');
const concat = require('gulp-concat');

// Define I/O paths
const root = './';
const src = 'src/';
const dist = 'public/';

const path = {
  css: {
    i: `${root + src}scss/**/*.scss`,
    o: `${root + dist}stylesheets/`,
  },
  js: {
    i: `${root + src}js/**/*.js`,
    o: `${root + dist}javascript/`,
  },
};

// Define options
const envProd = false;
const tasks = Object.keys(path);
const sassOptions = {
  errLogToConsole: !envProd,
  outputStyle: 'expanded',
};

// TASKS
gulp.task('default', (callback) => {
  runSequence('clean', tasks, callback);
});

gulp.task('stream', () =>
  watch('css/**/*.css', {
    ignoreInitial: false,
  })
    .pipe(gulp.dest(dist)));

gulp.task('callback', () =>
  // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
  watch(path.css.i, () => {
    gulp.src([path.css.i, path.js.i])
      .pipe(gulp.dest(dist));
  }));

// Delete the distribution folder
gulp.task('clean', () => gulp.src(`${root + dist}`, {
  read: false,
}).pipe(clean()));

// Scss
gulp.task('css', () => gulp
  .src([path.css.i])
  .pipe(envProd ? noop() : sourcemaps.init())
  .pipe(sass(sassOptions).on('error', sass.logError))
  .pipe(envProd ? noop() : sourcemaps.write())
  .pipe(gulp.dest(path.css.o)));

// Javascript
gulp.task('js', () => {
  gulp
    .src(path.js.i)
    .pipe(envProd ? noop() : sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(babel())
    .pipe(envProd ? noop() : sourcemaps.write('.'))
    .pipe(gulp.dest(path.js.o));
});

