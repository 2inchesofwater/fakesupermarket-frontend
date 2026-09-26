// gulpfile.js
const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const esbuild = require('gulp-esbuild');
const mergeStream = require('merge-stream');
const { exec } = require('child_process');
const path = require('path');


// Sibling projects that receive shared assets
const siblingProjects = [
  'fakesupermarket-brandguide',
  'fakesupermarket-participants',
  'fakesupermarket-clients'
].map(project => path.join(__dirname, `../${project}`));


// Shared source files
const sharedScssSources = [
  path.join(__dirname, 'src/scss/_fs-variables.scss'),
  path.join(__dirname, 'src/scss/_fs-styles.scss')
];

const sharedNunjucksSources = [
  path.join(__dirname, 'src/_includes/partials/**/*'),
];


// Pipe a stream to the same relative destination in every sibling project
function copyToSiblingProjects(stream, relativeDestination) {
  return siblingProjects.reduce(
    (currentStream, project) =>
      currentStream.pipe(dest(path.join(project, relativeDestination))),
    stream
  );
}


// Copy shared SCSS
function copySharedVariables() {
  return copyToSiblingProjects(
    src(sharedScssSources),
    'src/assets/scss/shared'
  );
}


// Copy shared Nunjucks
function copySharedNunjucks() {
  return copyToSiblingProjects(
    src(sharedNunjucksSources, {
      base: path.join(__dirname, 'src/_includes/partials')
    }),
    'src/_includes/partials'
  );
}


// Sass compilation task
function compileSass() {
  return src('src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('src/css'));
}


// CSS processing task
function css() {
  const siteCss = src('src/css/**/*.css')
    .pipe(postcss([cssnano()]))
    .pipe(dest('_site/css'));

  const sharedCss = copyToSiblingProjects(
    src('src/css/index.css')
      .pipe(postcss([cssnano()])),
    'src/assets/css'
  );

  return mergeStream(siteCss, sharedCss);
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
  watch(sharedScssSources, copySharedVariables);
  watch(sharedNunjucksSources, copySharedNunjucks);

  watch('src/scss/**/*.scss', compileSass);
  watch('src/css/**/*.css', css);
  watch('src/js/**/*.js', js);
}


// Clean task
function clean(cb) {
  exec('rm -rf _site', (err) => {
    cb(err);
  });
}


// Build task for production
const build = series(
  parallel(copySharedVariables, copySharedNunjucks),
  compileSass,
  parallel(css, js),
  eleventy
);


// Dev task for development
const dev = series(
  parallel(copySharedVariables, copySharedNunjucks),
  compileSass,
  parallel(css, js),
  parallel(eleventyServe, watchFiles)
);


exports.clean = clean;
exports.copySharedVariables = copySharedVariables;
exports.copySharedNunjucks = copySharedNunjucks;
exports.sass = compileSass;
exports.css = css;
exports.js = js;
exports.build = build;
exports.dev = dev;
exports.default = dev;