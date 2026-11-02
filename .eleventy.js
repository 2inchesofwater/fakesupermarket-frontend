const fs = require("fs");
const {
  isPrototype,
  outputDir,
  pageUrl
} = require("./build-config");

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

  // Format currency into individually styleable parts.
  eleventyConfig.addNunjucksFilter(
    "priceParts",
    function(amount, currency = "AUD", locale = "en-AU") {
      if (typeof amount !== "number" || !Number.isFinite(amount)) {
        throw new TypeError("formatPrice requires a finite numeric amount.");
      }

      const formatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        useGrouping: true
      });

      const classes = {
        integer: "major",
        fraction: "minor"
      };

      return formatter.formatToParts(amount).map(part => ({
        ...part,
        className: classes[part.type] ?? part.type
      }));
    }
  );

  // Add a Nunjucks filter for formatting prices
  eleventyConfig.addNunjucksFilter("toFixed", function(value, decimals = 2) {
    return parseFloat(value).toFixed(decimals);
  });

  // Add a shortcode for the current year
  eleventyConfig.addShortcode("year", () => {
    return new Date().getFullYear();
  });

  eleventyConfig.addGlobalData("assetVersion", Date.now());

  eleventyConfig.addNunjucksFilter("range", function(start, end) {
    return Array.from({ length: end - start }, (_, i) => start + i);
  });

  eleventyConfig.addNunjucksFilter("min", function(a, b) {
    return Math.min(a, b);
  });  
  
  eleventyConfig.setDataFileBaseName("index");

  eleventyConfig.addFilter("pageUrl", pageUrl);
  eleventyConfig.addNunjucksGlobal("resolvePageUrl", pageUrl);

  eleventyConfig.addGlobalData("prototypeBuild", isPrototype);

  eleventyConfig.addGlobalData(
    "showAuthDialogue",
    process.env.SHOW_AUTH_DIALOGUE === "true"
  );

  if (isPrototype) {
    eleventyConfig.setServerOptions({ port: 8081 });
  }

  return {
    dir: {
      input: "src",
      output: outputDir,
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};