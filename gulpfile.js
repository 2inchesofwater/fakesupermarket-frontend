// gulpfile.js
const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const esbuild = require('gulp-esbuild');
const { exec } = require('child_process');

// Sass compilation task
function compileSass() {
  return src('src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('src/css'));
}

// CSS processing task (just minification, no autoprefixer)
function css() {
  return src('src/css/**/*.css')
    .pipe(postcss([cssnano()]))
    .pipe(dest('_site/css'));
}

// JavaScript bundling task
function js() {
  return src('src/js/main.js', { allowEmpty: true })
    .pipe(esbuild({
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      sourcemap: process.env.NODE_ENV !== 'production',
      target: ['es2015']
    }))
    .pipe(dest('_site/js'));
}

// Eleventy build task
function eleventy(cb) {
  exec('npx @11ty/eleventy', (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      cb(err);
    } else {
      console.log(stdout);
      cb();
    }
  });
}

// Eleventy serve task
function eleventyServe(cb) {
  exec('npx @11ty/eleventy --serve', (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    // Do not call cb() as we want this process to keep running
  });
}

// Watch task
function watchFiles() {
  watch('src/scss/**/*.scss', compileSass);
  watch('src/css/**/*.css', css);
  watch('src/js/**/*.js', js);
  // Eleventy has its own watch through --serve
}

// Clean task (optional)
function clean(cb) {
  exec('rm -rf _site', (err) => {
    cb(err);
  });
}

// Build task for production
const build = series(
  compileSass,
  parallel(css, js),
  eleventy
);

// Dev task for development
const dev = series(
  compileSass,
  parallel(css, js),
  parallel(eleventyServe, watchFiles)
);

exports.clean = clean;
exports.sass = compileSass;
exports.css = css;
exports.js = js;
exports.build = build;
exports.dev = dev;
exports.default = dev;