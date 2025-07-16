const fs = require("fs");

module.exports = async function(eleventyConfig) {
  
  // Pass through static files
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/pages/**/*.{jpg,jpeg,png,avif,gif,svg,webp}");

  eleventyConfig.addFilter("relativePath", function(path, base) {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }
    return base + path;
  });

  eleventyConfig.addFilter("fs", function(path) {
    return fs.readFileSync(path, "utf8");
  });

  // Add a Nunjucks filter for formatting prices
  eleventyConfig.addNunjucksFilter("toFixed", function(value, decimals = 2) {
    return parseFloat(value).toFixed(decimals);
  });

  // Add a shortcode for the current year
  eleventyConfig.addShortcode("year", () => {
    return new Date().getFullYear();
  });

  eleventyConfig.addNunjucksFilter("range", function(start, end) {
    return Array.from({ length: end - start }, (_, i) => start + i);
  });

  eleventyConfig.addNunjucksFilter("min", function(a, b) {
    return Math.min(a, b);
  });  
  
  eleventyConfig.setDataFileBaseName("index");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};