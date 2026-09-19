// gulpfile.js
const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const esbuild = require('gulp-esbuild');
const mergeStream = require('merge-stream');
const { exec } = require('child_process');
const path = require('path');

const brandGuideProject = path.join(
  __dirname,
  '../fakesupermarket-brandguide'
);

const participantsProject = path.join(
  __dirname,
  '../fakesupermarket-participants'
);

const sharedScssSources = [
  path.join(__dirname, 'src/scss/_fs-variables.scss'),
  path.join(__dirname, 'src/scss/_fs-styles.scss')
];

const sharedNunjucksSources = [
  path.join(__dirname, 'src/_includes/partials/**/*'),
];

const brandGuideVariablesDestination = path.join(
  brandGuideProject,
  'src/assets/scss/shared'
);

const participantsVariablesDestination = path.join(
  participantsProject,
  'src/assets/scss/shared'
);

const brandGuideCssDestination = path.join(
  brandGuideProject,
  'src/assets/css'
);

const participantsCssDestination = path.join(
  participantsProject,
  'src/assets/css'
);

const brandGuideNunjucksDestination = path.join(
  brandGuideProject,
  'src/_includes/partials'
);
const participantsNunjucksDestination = path.join(
  participantsProject,
  'src/_includes/partials'
);

function copySharedVariables() {
  return src(sharedScssSources)
    .pipe(dest(brandGuideVariablesDestination))
    .pipe(dest(participantsVariablesDestination));
}
function copySharedNunjucks() {
  return src(sharedNunjucksSources, {
    base: path.join(__dirname, 'src/_includes/partials')
  })
    .pipe(dest(participantsNunjucksDestination))
    .pipe(dest(brandGuideNunjucksDestination));
}


// Sass compilation task
function compileSass() {
  return src('src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('src/css'));
}

// CSS processing task (just minification, no autoprefixer)
function css() {
  const siteCss = src('src/css/**/*.css')
    .pipe(postcss([cssnano()]))
    .pipe(dest('_site/css'));

  const participantsCss = src('src/css/index.css')
    .pipe(postcss([cssnano()]))
    .pipe(dest(brandGuideCssDestination))
    .pipe(dest(participantsCssDestination));

  return mergeStream(siteCss, participantsCss);
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

// Clean task (optional)
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