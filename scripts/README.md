# Product Scraper Tool

This directory contains automated tools for scraping product data from supermarket websites to populate the product JSON files in the fakesupermarket-frontend project.

## Overview

The product scraper tool (`scrape-products.js`) automates the process of gathering product information from rival supermarket chains. Instead of manually copy-pasting product data into JSON files, you can now provide URLs to supermarket category pages and automatically extract ~25 products with their details.

**For a complete step-by-step guide, see [WORKFLOW.md](WORKFLOW.md).**

## Prerequisites

Before using the scraper, you need to install required dependencies:

```bash
npm install --save-dev cheerio axios
```

Or they will be installed automatically with:

```bash
npm install
```

## Installation

From the project root:

```bash
npm install
```

## Quick Start / Demo

To verify the scraper is working correctly, run the demo:

```bash
npm run scrape:demo
```

Or directly:

```bash
node scripts/demo.js
```

This will:
- Start a temporary HTTP server with sample HTML
- Run the scraper against it
- Display the scraped product data
- Confirm everything is working

## Usage

### Basic Usage

Using npm script (recommended):

```bash
npm run scrape -- \
  --urls "https://example-supermarket.com/meat" "https://rival-market.com/meat" \
  --output src/_data/meat-scraped.json \
  --count 25
```

Or directly:

```bash
node scripts/scrape-products.js \
  --urls "https://example-supermarket.com/meat" "https://rival-market.com/meat" \
  --output src/_data/meat-scraped.json \
  --count 25
```

### Command Line Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--urls` | `-u` | Space-separated list of URLs to scrape | Required |
| `--output` | `-o` | Output file path for the JSON data | Stdout |
| `--count` | `-c` | Number of products to scrape | 25 |
| `--timeout` | `-t` | Timeout for page loads in milliseconds | 30000 |

### Examples

#### Example 1: Scrape and save to new file

```bash
node scripts/scrape-products.js \
  --urls "https://example-supermarket.com/meat-poultry" \
  --output src/_data/meat-scraped.json \
  --count 25
```

#### Example 2: Scrape from multiple sites

```bash
node scripts/scrape-products.js \
  --urls "https://supermarket-a.com/meat" "https://supermarket-b.com/meat" \
  --output src/_data/meat.json \
  --count 30
```

#### Example 3: Scrape with longer timeout

```bash
node scripts/scrape-products.js \
  --urls "https://example-supermarket.com/meat" \
  --output src/_data/meat-test.json \
  --count 10 \
  --timeout 60000
```

#### Example 4: Output to console instead of file

```bash
node scripts/scrape-products.js \
  --urls "https://example-supermarket.com/meat"
```

## How It Works

The scraper:

1. **Fetches each URL** using HTTP requests (via axios)
2. **Parses the HTML** using Cheerio (jQuery-like selector library)
3. **Detects product elements** on the page using common selectors
4. **Extracts product data** including:
   - Product name
   - Brand
   - Price
   - Weight/size
   - Product images
   - Description
5. **Transforms the data** to match the meat.json schema format
6. **Generates additional fields** like SKU, slug, nutrition info
7. **Saves the output** to the specified JSON file or prints to console

## Output Format

The scraper generates products in the same format as the existing `meat.json` file:

```json
{
  "productsAll": [
    {
      "id": "product-slug",
      "productName": "Product Name",
      "productSlug": "product-slug",
      "productSku": "123456",
      "productBrand": "Brand Name",
      "descriptionShort": "Short description...",
      "descriptionLong": "Longer description...",
      "priceRrp": "12.99",
      "priceCurrent": null,
      "pricePerUnit": "25.98",
      "productPerUnit": "kg",
      "badgeLabel": null,
      "badgeClassName": null,
      "featuredLabel": null,
      "productGrossWeight": "500g",
      "productMeasurements": {},
      "categories": ["meat-seafood"],
      "related_products": [],
      "attributes": {
        "origin": "Australia",
        "organic": false,
        "packaging": "",
        "dietary": [],
        "servings": {
          "serving_size": "100g",
          "servings_per_package": "5"
        },
        "nutrition": { /* ... */ },
        "storage_instructions": "Keep refrigerated at 0-4°C."
      },
      "images": ["product-image.jpg"],
      "imagesVisualDescription": null,
      "productAverageRating": null,
      "productCountRatings": 0
    }
  ]
}
```

## Important Notes

### Product Images

The scraper extracts image URLs but **does not download the images**. You need to:

1. Manually download the product images from the scraped URLs
2. Place them in the appropriate directory (e.g., `src/pages/meat/`)
3. Update the image filenames in the JSON if needed

### Nutrition Information

The scraper generates **placeholder nutrition information**. For accurate data, you should:

1. Review each product's nutrition facts on the original website
2. Manually update the nutrition values in the generated JSON

### Legal and Ethical Considerations

⚠️ **Important**: Web scraping may be subject to legal restrictions. Always:

- Check the website's `robots.txt` file
- Review the website's Terms of Service
- Respect rate limits and don't overload servers
- Use scraped data responsibly and legally
- Consider using official APIs if available

### Limitations

The scraper uses static HTML parsing with Cheerio. It may not work on:

- **JavaScript-heavy sites**: Pages that load content dynamically via JavaScript
- **Single Page Applications (SPAs)**: React, Vue, Angular apps that render client-side
- **Sites with anti-bot measures**: CAPTCHAs, rate limiting, etc.
- **Unusual page layouts**: Non-standard HTML structures

If the scraper doesn't work on a specific site, you may need to:

1. Check if the page has server-rendered HTML
2. Customize the selectors in `scrape-products.js`
3. Add site-specific scraping logic
4. Consider using Puppeteer for JavaScript-rendered sites

## Workflow Integration

### Typical Workflow

1. **Find product pages** on rival supermarket websites
2. **Run the scraper** with those URLs
3. **Review the output** in the generated JSON file
4. **Download product images** and place them in `src/pages/meat/`
5. **Update/refine data** as needed (nutrition, descriptions, etc.)
6. **Test the frontend** to ensure products display correctly
7. **Commit the changes** to your repository

### Updating Existing Data

If you already have a `meat.json` file with configuration data (like `storefrontName`, `breadcrumbs`, etc.), the scraper will:

- Read the existing file
- Replace only the `productsAll` array
- Preserve all other configuration

## Troubleshooting

### Error: Module 'cheerio' not found

**Solution**: Install dependencies:
```bash
npm install --save-dev cheerio axios
```

### No products found

**Possible causes**:
- The URL doesn't contain a product listing
- The page uses non-standard HTML structure
- The page requires JavaScript to render (static HTML scraping won't work)
- The page requires authentication
- Rate limiting or anti-bot measures

**Solutions**:
- Check if the page loads properly in a regular browser
- Try a different category page URL
- Customize selectors in the script
- For JavaScript-heavy sites, consider using Puppeteer instead

### Browser launch failed

This scraper uses Cheerio for HTML parsing and doesn't require a browser. If you need JavaScript rendering, consider using Puppeteer or Playwright separately.

### Scraped data is incomplete

The scraper does its best to extract data, but may not find all fields. Common issues:

- **Missing brands**: Some sites don't clearly mark brands
- **Missing weights**: Weight might be in the product name
- **Incorrect prices**: Price formats vary by site

Review and manually correct the generated JSON as needed.

## Future Enhancements

Possible improvements for the scraper:

- [ ] Support for site-specific scrapers
- [ ] Automatic image downloading
- [ ] Better nutrition data extraction
- [ ] CSV import/export
- [ ] Interactive product selection
- [ ] Automatic deduplication
- [ ] Price comparison features

## Support

For issues or questions:

1. Check this README
2. Review the `scrape-products.js` comments
3. Open an issue in the GitHub repository

## License

This tool is part of the fakesupermarket-frontend project and follows the same license.
