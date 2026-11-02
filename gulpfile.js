const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const esbuild = require('gulp-esbuild');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const fs = require('node:fs/promises');
const path = require('node:path');
const { isPrototype, outputDir } = require('./build-config');

const outputPath = path.join(__dirname, outputDir);
const prototypeOutputPath = path.join(__dirname, '_site-prototypes');
const eleventyCli = path.join(
  __dirname, 'node_modules', '@11ty', 'eleventy', 'cmd.cjs'
);

// Normal builds continue to distribute shared files to sibling projects.
const siblingProjects = [
  'fakesupermarket-brandguide',
  'fakesupermarket-participants',
  'fakesupermarket-clients',
  'fakesupermarket-staticpages'
].map(project => path.join(__dirname, '..', project));

const sharedScssSources = [
  path.join(__dirname, 'src/scss/_fs-variables.scss'),
  path.join(__dirname, 'src/scss/_fs-styles.scss')
];

const sharedNunjucksSources = [
  path.join(__dirname, 'src/_includes/partials/**/*')
];

function copyToSiblingProjects(stream, relativeDestination) {
  return siblingProjects.reduce(
    (currentStream, project) =>
      currentStream.pipe(dest(path.join(project, relativeDestination))),
    stream
  );
}

function copySharedVariables() {
  return copyToSiblingProjects(
    src(sharedScssSources),
    'src/assets/scss/shared'
  );
}

function copySharedNunjucks() {
  return copyToSiblingProjects(
    src(sharedNunjucksSources, {
      base: path.join(__dirname, 'src/_includes/partials')
    }),
    'src/_includes/partials'
  );
}

function compileSass() {
  return src('src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('src/css'));
}

function cssSite() {
  return src('src/css/**/*.css')
    .pipe(postcss([cssnano()]))
    .pipe(dest(path.join(outputPath, 'css')));
}

function cssShared() {
  return copyToSiblingProjects(
    src('src/css/index.css').pipe(postcss([cssnano()])),
    'src/assets/css'
  );
}

const css = parallel(cssSite, cssShared);

function js() {
  return src('src/js/main.js', { allowEmpty: true })
    .pipe(esbuild({
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      sourcemap: process.env.NODE_ENV !== 'production',
      target: ['es2015']
    }))
    .pipe(dest(path.join(outputPath, 'js')));
}

function runEleventy(args = []) {
  // Inherit all settings, including BUILD_TARGET and SHOW_AUTH_DIALOGUE.
  // Passing output explicitly keeps Gulp and Eleventy on the same directory.
  return spawn(
    process.execPath,
    [eleventyCli, `--output=${outputDir}`, ...args],
    { cwd: __dirname, stdio: 'inherit' }
  );
}

function eleventy() {
  return runEleventy();
}

function eleventyServe() {
  return runEleventy(['--serve']);
}

function watchFiles() {
  watch(sharedScssSources, copySharedVariables);
  watch(sharedNunjucksSources, copySharedNunjucks);
  watch('src/scss/**/*.scss', compileSass);
  watch('src/css/**/*.css', css);
  watch('src/js/**/*.js', js);
}

function watchPrototypeFiles() {
  // Prototype previews never invoke the sibling-copy tasks.
  watch('src/scss/**/*.scss', compileSass);
  watch('src/css/**/*.css', cssSite);
  watch('src/js/**/*.js', js);
}

async function clean() {
  await fs.rm(outputPath, { recursive: true, force: true });
}

async function preparePrototypeOutput() {
  if (!isPrototype || outputPath !== prototypeOutputPath) {
    throw new Error(
      'Use npm run start:prototypes or npm run build:prototypes ' +
      'with BUILD_TARGET=prototypes and outputDir=_site-prototypes.'
    );
  }

  // Recreate only the prototype output. Existing _site pages remain intact.
  await fs.rm(prototypeOutputPath, { recursive: true, force: true });
}

function copyPrototypePreviewAssets() {
  // Some shared assets currently live only in _site. Copy them for preview,
  // retaining their public paths without copying any historical HTML pages.
  const sharedRoot = path.join(__dirname, '_site');
  const sources = ['css', 'js', 'fonts', 'images', 'assets']
    .filter(directory => existsSync(path.join(sharedRoot, directory)))
    .map(directory => path.join(sharedRoot, directory, '**/*'));

  if (existsSync(path.join(sharedRoot, 'pages'))) {
    sources.push(path.join(
      sharedRoot, 'pages', '**/*.{jpg,jpeg,png,avif,gif,svg,webp}'
    ));
  }

  if (sources.length === 0) {
    return Promise.resolve();
  }

  return src(sources, {
    base: sharedRoot,
    encoding: false,
    allowEmpty: true
  }).pipe(dest(prototypeOutputPath));
}

// Preserve the existing normal build and development workflows.
const build = series(
  parallel(copySharedVariables, copySharedNunjucks),
  compileSass,
  parallel(css, js),
  eleventy
);

const dev = series(
  parallel(copySharedVariables, copySharedNunjucks),
  compileSass,
  parallel(css, js),
  parallel(eleventyServe, watchFiles)
);

const buildPrototypes = series(
  preparePrototypeOutput,
  copyPrototypePreviewAssets,
  compileSass,
  eleventy,
  // Eleventy copies source CSS/JS, so optimise after it finishes.
  parallel(cssSite, js)
);

const devPrototypes = series(
  preparePrototypeOutput,
  copyPrototypePreviewAssets,
  compileSass,
  parallel(cssSite, js),
  parallel(eleventyServe, watchPrototypeFiles)
);

exports.clean = clean;
exports.copySharedVariables = copySharedVariables;
exports.copySharedNunjucks = copySharedNunjucks;
exports.sass = compileSass;
exports.css = css;
exports.js = js;
exports.build = build;
exports.dev = dev;
exports.buildPrototypes = buildPrototypes;
exports.devPrototypes = devPrototypes;
exports.default = dev;
