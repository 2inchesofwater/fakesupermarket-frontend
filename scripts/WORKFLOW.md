# Product Data Workflow Guide

This guide explains how to use the automated product scraper to populate your product catalog.

## The Problem

Previously, populating the `meat.json` file with product data required:
1. Manually browsing rival supermarket websites
2. Copy-pasting each product's:
   - Name
   - Brand
   - Price
   - Weight/size
   - Description
   - Image URL
3. Formatting all data into the JSON structure
4. Repeating for 20-25 products

This manual process is time-consuming, error-prone, and tedious.

## The Solution

The automated product scraper solves this by:
- **Accepting URLs** from rival supermarket product pages
- **Automatically extracting** all product data
- **Transforming** data to match your JSON schema
- **Generating** a ready-to-use JSON file

## Quick Start

### 1. Test the Scraper

First, verify everything works with the demo:

```bash
npm run scrape:demo
```

You should see output like:
```
✓ Successfully scraped 3 products
Sample product data: {...}
```

### 2. Find Product URLs

Visit rival supermarket websites and find their product category pages. Look for pages like:
- `https://www.example-supermarket.com/meat-and-poultry`
- `https://www.rival-market.com/categories/fresh-meat`
- `https://www.another-store.com/departments/meat-seafood`

### 3. Run the Scraper

Basic command:

```bash
npm run scrape -- \
  --urls "https://www.example-supermarket.com/meat" \
  --output src/_data/meat.json \
  --count 25
```

From multiple sites:

```bash
npm run scrape -- \
  --urls "https://supermarket-a.com/meat" "https://supermarket-b.com/meat" \
  --output src/_data/meat.json \
  --count 30
```

### 4. Review the Output

The scraper will:
- Fetch the pages
- Extract product information
- Generate the JSON file
- Report success

Example output:
```
Fetching: https://example-supermarket.com/meat
Found 20 products with selector: .product-card
Scraped 20 products from https://example-supermarket.com/meat
Total products scraped: 20
Wrote products to: src/_data/meat.json
```

### 5. Handle Product Images

The scraper extracts image URLs but doesn't download them. You need to:

1. Check the generated JSON for image filenames
2. Download the images from their URLs
3. Save them to `src/pages/meat/`
4. Optionally rename them to match your naming convention

### 6. Review and Refine

Open the generated `meat.json` and review:

- **Prices**: Ensure they're formatted correctly
- **Weights**: Check units (g, kg, etc.)
- **Descriptions**: May need editing for consistency
- **Brands**: Verify they were extracted correctly
- **Nutrition**: Currently uses placeholder data - update if needed

### 7. Test the Frontend

Build and view the site:

```bash
npm run build
# Or for development
npm start
```

Visit the meat category page to see your products displayed.

## Advanced Usage

### Filtering Products

If you want specific products, you can:
1. Scrape more than needed (e.g., `--count 50`)
2. Manually edit the JSON to keep only desired products
3. Re-run with different URLs

### Merging Data Sources

To combine products from multiple sources:

```bash
# Scrape from first source
npm run scrape -- \
  --urls "https://site-a.com/meat" \
  --output /tmp/products-a.json \
  --count 15

# Scrape from second source  
npm run scrape -- \
  --urls "https://site-b.com/meat" \
  --output /tmp/products-b.json \
  --count 15

# Manually merge the JSON files or use a script
```

### Customizing the Scraper

If the scraper doesn't work well with a specific site, you can:

1. Edit `scripts/scrape-products.js`
2. Adjust the CSS selectors in the `scrapeProductsFromPage` function
3. Add site-specific logic

Example:
```javascript
// In scrapeProductsFromPage function
if (url.includes('specificsite.com')) {
  // Use custom selectors for this site
  productElements = $('.specific-site-product-class');
}
```

## Command Reference

### Basic Command Structure

```bash
npm run scrape -- [OPTIONS]
```

Or directly:

```bash
node scripts/scrape-products.js [OPTIONS]
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--urls` | URLs to scrape (space-separated) | `--urls "url1" "url2"` |
| `--output` | Output JSON file path | `--output src/_data/meat.json` |
| `--count` | Number of products to scrape | `--count 25` |
| `--timeout` | Request timeout in milliseconds | `--timeout 60000` |

## Best Practices

### Legal and Ethical

1. **Check robots.txt**: Visit `https://site.com/robots.txt` to see if scraping is allowed
2. **Review Terms of Service**: Some sites explicitly prohibit scraping
3. **Use rate limiting**: Don't hammer servers with requests
4. **Consider APIs**: Many retailers offer official APIs

### Technical

1. **Start small**: Test with `--count 5` first
2. **Use descriptive output names**: e.g., `meat-woolworths.json` instead of `output.json`
3. **Backup existing data**: Don't overwrite your working JSON without a backup
4. **Version control**: Commit after successful scrapes

### Quality

1. **Review all data**: The scraper does its best but isn't perfect
2. **Standardize descriptions**: Edit for tone and length consistency
3. **Update nutrition facts**: Replace placeholder data with real values
4. **Verify prices**: Ensure currency and format are correct

## Troubleshooting

### No Products Found

**Cause**: The scraper couldn't detect products on the page.

**Solutions**:
- Check if the URL loads in your browser
- Verify the page has a product listing (not a splash page)
- The site might use JavaScript to load products (requires Puppeteer)
- Try a different category page URL

### Incomplete Data

**Cause**: Some fields couldn't be extracted.

**Solutions**:
- Review the HTML structure of the source page
- Customize selectors in the script
- Manually fill in missing data after scraping

### Network Errors

**Cause**: Connection issues or rate limiting.

**Solutions**:
- Check your internet connection
- Increase timeout: `--timeout 60000`
- Try again later (you might be rate-limited)
- Use a VPN if the site is geo-restricted

### Script Errors

**Cause**: Code issue or missing dependencies.

**Solutions**:
- Run `npm install` to ensure dependencies are installed
- Check Node.js version (14.x or higher required)
- Review error messages for details

## Workflow Examples

### Example 1: New Category

Creating a new "Dairy" category:

```bash
# 1. Scrape dairy products
npm run scrape -- \
  --urls "https://supermarket.com/dairy" \
  --output src/_data/dairy.json \
  --count 25

# 2. Download images to src/pages/dairy/

# 3. Review and edit dairy.json

# 4. Create dairy.njk template (copy from meat.njk)

# 5. Build and test
npm run build
```

### Example 2: Updating Existing Products

Refreshing the meat category:

```bash
# 1. Backup current data
cp src/_data/meat.json src/_data/meat-backup.json

# 2. Scrape fresh data
npm run scrape -- \
  --urls "https://supermarket.com/meat" \
  --output src/_data/meat-new.json \
  --count 25

# 3. Compare and merge as needed
diff src/_data/meat.json src/_data/meat-new.json

# 4. Use the new file or merge manually
mv src/_data/meat-new.json src/_data/meat.json
```

### Example 3: Price Comparison

Comparing prices across multiple retailers:

```bash
# Scrape from Retailer A
npm run scrape -- \
  --urls "https://retailer-a.com/meat" \
  --output /tmp/retailer-a-meat.json \
  --count 20

# Scrape from Retailer B
npm run scrape -- \
  --urls "https://retailer-b.com/meat" \
  --output /tmp/retailer-b-meat.json \
  --count 20

# Compare prices manually or with a script
# Select best-priced products for your catalog
```

## Getting Help

1. **Read the documentation**: [scripts/README.md](README.md)
2. **Run the demo**: `npm run scrape:demo`
3. **Check examples**: [scripts/examples.sh](examples.sh)
4. **Review the code**: The scraper is well-commented

## Next Steps

After successfully using the scraper:

1. **Automate further**: Create scheduled jobs to refresh data
2. **Add more categories**: Repeat the process for other departments
3. **Enhance the scraper**: Add features like image downloading
4. **Share improvements**: Contribute back to the project

## Summary

The product scraper transforms this workflow:

**Before** (manual):
```
1. Open browser
2. Navigate to product page
3. Copy product name → Paste in JSON
4. Copy price → Paste in JSON
5. Copy weight → Paste in JSON
6. Copy description → Paste in JSON
7. Right-click image → Copy URL → Paste in JSON
8. Repeat 24 more times (15-30 minutes)
```

**After** (automated):
```bash
npm run scrape -- --urls "https://site.com/meat" --output meat.json --count 25
# (30 seconds)
```

This saves significant time and reduces errors while maintaining data quality.
