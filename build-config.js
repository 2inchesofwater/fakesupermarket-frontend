const isPrototype = process.env.BUILD_TARGET === "prototypes";
const outputDir = isPrototype ? "_site-prototypes" : "_site";
const pagePrefix = isPrototype ? "/prototypes" : "/pages";

function pageUrl(route, filenameSlug) {
  return `${pagePrefix}/${route}/${filenameSlug}.html`;
}

module.exports = {
  isPrototype,
  outputDir,
  pageUrl
};