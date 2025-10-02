#!/usr/bin/env node

/**
 * Product Scraper for Supermarket Websites
 * 
 * This script scrapes product data from rival supermarket chains and
 * generates a JSON file compatible with the fakesupermarket-frontend format.
 * 
 * Usage:
 *   node scripts/scrape-products.js --urls <url1> <url2> --output <file> [--count 25]
 * 
 * Example:
 *   node scripts/scrape-products.js \
 *     --urls "https://example-supermarket.com/meat" "https://rival-market.com/meat" \
 *     --output src/_data/meat.json \
 *     --count 25
 */

const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    urls: [],
    output: null,
    count: 25,
    timeout: 30000
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--urls' || args[i] === '-u') {
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        config.urls.push(args[i]);
        i++;
      }
      i--;
    } else if (args[i] === '--output' || args[i] === '-o') {
      config.output = args[++i];
    } else if (args[i] === '--count' || args[i] === '-c') {
      config.count = parseInt(args[++i], 10);
    } else if (args[i] === '--timeout' || args[i] === '-t') {
      config.timeout = parseInt(args[++i], 10);
    }
  }

  return config;
}

// Generate a unique SKU
function generateSku() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a slug from product name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Extract price from text
function extractPrice(text) {
  if (!text) return null;
  const match = text.match(/\$?(\d+\.?\d*)/);
  return match ? parseFloat(match[1]).toFixed(2) : null;
}

// Extract weight from text
function extractWeight(text) {
  if (!text) return null;
  const match = text.match(/(\d+\.?\d*)\s*(kg|g|lb|oz)/i);
  return match ? match[0] : null;
}

// Generic scraper for product listings
async function scrapeProductsFromPage(url) {
  console.log(`Fetching: ${url}`);
  
  try {
    // Fetch the HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    const results = [];
    
    // Common selectors for product cards/items
    const selectors = [
      '[data-product]',
      '.product-card',
      '.product-item',
      '.product',
      '[class*="product-"]',
      'article[class*="product"]',
      'li[class*="product"]'
    ];
    
    let productElements = null;
    
    // Try each selector until we find products
    for (const selector of selectors) {
      productElements = $(selector);
      if (productElements.length > 0) {
        console.log(`Found ${productElements.length} products with selector: ${selector}`);
        break;
      }
    }
    
    // If no products found with standard selectors, try image containers
    if (!productElements || productElements.length === 0) {
      const imgContainers = $('[class*="grid"] img, [class*="list"] img').parent();
      if (imgContainers.length > 0) {
        productElements = imgContainers;
        console.log(`Found ${productElements.length} products via image containers`);
      }
    }
    
    // Process each product element
    productElements.each((index, element) => {
      if (index >= 30) return; // Limit to 30 per page
      
      const $el = $(element);
      
      // Try to extract product information
      const productData = {
        name: null,
        brand: null,
        price: null,
        weight: null,
        image: null,
        description: null
      };
      
      // Extract name (try various selectors)
      const nameSelectors = [
        'h2', 'h3', 'h4',
        '[class*="name"]',
        '[class*="title"]',
        'a[class*="product"]',
        '.product-name',
        '.product-title'
      ];
      
      for (const selector of nameSelectors) {
        const nameText = $el.find(selector).first().text().trim();
        if (nameText) {
          productData.name = nameText;
          break;
        }
      }
      
      // Extract price
      const priceSelectors = [
        '[class*="price"]',
        '[data-price]',
        'span[class*="dollar"]',
        '.price',
        '[class*="cost"]'
      ];
      
      for (const selector of priceSelectors) {
        const priceText = $el.find(selector).first().text().trim();
        if (priceText) {
          productData.price = priceText;
          break;
        }
      }
      
      // Extract brand
      const brandSelectors = [
        '[class*="brand"]',
        '[data-brand]',
        '.brand'
      ];
      
      for (const selector of brandSelectors) {
        const brandText = $el.find(selector).first().text().trim();
        if (brandText) {
          productData.brand = brandText;
          break;
        }
      }
      
      // Extract weight from text
      const elementText = $el.text();
      const weightMatch = elementText.match(/(\d+\.?\d*)\s*(kg|g|lb|oz)/i);
      if (weightMatch) {
        productData.weight = weightMatch[0];
      }
      
      // Extract image
      const $img = $el.find('img').first();
      if ($img.length > 0) {
        productData.image = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
      }
      
      // Extract description
      const descSelectors = [
        '[class*="description"]',
        'p',
        '[class*="desc"]'
      ];
      
      for (const selector of descSelectors) {
        const descText = $el.find(selector).first().text().trim();
        if (descText && descText.length > 20) {
          productData.description = descText;
          break;
        }
      }
      
      // Only add if we have at least a name
      if (productData.name) {
        results.push(productData);
      }
    });
    
    return results;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return [];
  }
}

// Convert scraped data to meat.json format
function convertToMeatFormat(scrapedProducts) {
  return scrapedProducts.map(product => {
    const price = extractPrice(product.price);
    const weight = extractWeight(product.weight || product.name);
    
    return {
      id: generateSlug(product.name),
      productName: product.name,
      productSlug: generateSlug(product.name),
      productSku: generateSku(),
      productBrand: product.brand || 'Unknown Brand',
      descriptionShort: product.description ? product.description.substring(0, 100) : '',
      descriptionLong: product.description || '',
      priceRrp: price,
      priceCurrent: null,
      pricePerUnit: price ? (parseFloat(price) * 4).toFixed(2) : '0.00',
      productPerUnit: 'kg',
      badgeLabel: null,
      badgeClassName: null,
      featuredLabel: null,
      productGrossWeight: weight || '500g',
      productMeasurements: {},
      categories: ['meat-seafood'],
      related_products: [],
      attributes: {
        origin: 'Australia',
        organic: false,
        packaging: '',
        dietary: [],
        servings: {
          serving_size: '100g',
          servings_per_package: '5'
        },
        nutrition: {
          energy: { '100g': '610.0kJ', serving: '1220.0kJ', pdi: null },
          protein: { '100g': '10.2g', serving: '21.2g', pdi: null },
          fat_total: { '100g': '2.6g', serving: '5.2g', pdi: null },
          fat_saturated: { '100g': '0.7g', serving: '1.2g', pdi: null },
          carbohydrates_total: { '100g': '19.8g', serving: '39.2g', pdi: null },
          carbohydrates_sugar: { '100g': '4.2g', serving: '8.4g', pdi: null },
          sodium: { '100g': '385.0mg', serving: '770.0mg', pdi: null },
          potassium: { '100g': '-', serving: '-', pdi: null },
          fibre: { '100g': '-', serving: '-', pdi: null }
        },
        storage_instructions: 'Keep refrigerated at 0-4°C.'
      },
      images: product.image ? [path.basename(product.image)] : [],
      imagesVisualDescription: null,
      productAverageRating: null,
      productCountRatings: 0
    };
  });
}

// Main scraping function
async function scrapeProducts(config) {
  console.log('Starting product scraper...');
  console.log(`Target URLs: ${config.urls.join(', ')}`);
  console.log(`Target count: ${config.count}`);
  
  let allProducts = [];
  
  for (const url of config.urls) {
    const products = await scrapeProductsFromPage(url);
    allProducts = allProducts.concat(products);
    console.log(`Scraped ${products.length} products from ${url}`);
  }
  
  console.log(`Total products scraped: ${allProducts.length}`);
  
  // Limit to requested count
  if (allProducts.length > config.count) {
    allProducts = allProducts.slice(0, config.count);
    console.log(`Limited to ${config.count} products`);
  }
  
  // Convert to meat.json format
  const formattedProducts = convertToMeatFormat(allProducts);
  
  return formattedProducts;
}

// Main function
async function main() {
  const config = parseArgs();
  
  if (config.urls.length === 0) {
    console.error('Error: No URLs provided. Use --urls to specify URLs to scrape.');
    console.log('\nUsage:');
    console.log('  node scripts/scrape-products.js --urls <url1> <url2> --output <file> [--count 25]');
    console.log('\nExample:');
    console.log('  node scripts/scrape-products.js \\');
    console.log('    --urls "https://example-supermarket.com/meat" \\');
    console.log('    --output src/_data/meat-scraped.json \\');
    console.log('    --count 25');
    process.exit(1);
  }
  
  try {
    const products = await scrapeProducts(config);
    
    console.log(`\nScraped ${products.length} products successfully`);
    
    if (config.output) {
      // If output file exists, read it and merge
      let existingData = {};
      if (fs.existsSync(config.output)) {
        const content = fs.readFileSync(config.output, 'utf8');
        existingData = JSON.parse(content);
        console.log('Existing data found, will merge with productsAll array');
      }
      
      // Update productsAll array
      existingData.productsAll = products;
      
      // Write to file
      fs.writeFileSync(config.output, JSON.stringify(existingData, null, 2));
      console.log(`Wrote products to: ${config.output}`);
    } else {
      // Print to console
      console.log('\n--- SCRAPED PRODUCTS ---');
      console.log(JSON.stringify({ productsAll: products }, null, 2));
    }
    
    console.log('\nScraping completed successfully!');
    console.log('\nNote: Downloaded product images need to be placed in src/pages/meat/');
    console.log('Image URLs found:', products.filter(p => p.images.length > 0).length);
    
  } catch (error) {
    console.error('Error during scraping:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { scrapeProducts, convertToMeatFormat };
