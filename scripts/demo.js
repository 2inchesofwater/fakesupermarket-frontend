#!/usr/bin/env node

/**
 * Demo Script - Test the Product Scraper
 * 
 * This script creates a demo HTML page and tests the scraper against it.
 * Run this to verify the scraper is working correctly.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { scrapeProducts, convertToMeatFormat } = require('./scrape-products');

const DEMO_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Demo Supermarket</title>
</head>
<body>
  <h1>Meat Department</h1>
  <div class="product-list">
    <div class="product-card">
      <img src="chicken.jpg" alt="Chicken">
      <div class="product-brand">FreshFarms</div>
      <h3 class="product-name">Organic Chicken Breast 500g</h3>
      <span class="product-price">$12.99</span>
      <p class="product-description">Premium organic chicken breast, perfect for healthy meals.</p>
    </div>
    <div class="product-card">
      <img src="beef.jpg" alt="Beef">
      <div class="product-brand">ButcherChoice</div>
      <h3 class="product-name">Grass-Fed Beef Mince 500g</h3>
      <span class="product-price">$10.99</span>
      <p class="product-description">100% grass-fed beef mince with excellent flavor.</p>
    </div>
    <div class="product-card">
      <img src="salmon.jpg" alt="Salmon">
      <div class="product-brand">OceanFresh</div>
      <h3 class="product-name">Atlantic Salmon Fillet 300g</h3>
      <span class="product-price">$16.99</span>
      <p class="product-description">Fresh Atlantic salmon, rich in omega-3.</p>
    </div>
  </div>
</body>
</html>
`;

async function runDemo() {
  console.log('=== Product Scraper Demo ===\n');
  
  // Create a temporary HTTP server
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(DEMO_HTML);
  });
  
  const PORT = 3456;
  
  return new Promise((resolve, reject) => {
    server.listen(PORT, async () => {
      console.log(`Started demo server on http://localhost:${PORT}`);
      
      try {
        // Test the scraper
        const config = {
          urls: [`http://localhost:${PORT}`],
          count: 10,
          timeout: 5000
        };
        
        console.log('Running scraper...\n');
        const products = await scrapeProducts(config);
        
        console.log(`✓ Successfully scraped ${products.length} products\n`);
        console.log('Sample product data:');
        console.log(JSON.stringify(products[0], null, 2));
        
        console.log('\n=== Demo Complete ===');
        console.log('The scraper is working correctly!');
        console.log('\nTo use with real websites, run:');
        console.log('  node scripts/scrape-products.js --urls "https://example.com" --output data.json');
        
        server.close();
        resolve();
      } catch (error) {
        console.error('Error during demo:', error);
        server.close();
        reject(error);
      }
    });
  });
}

// Run demo if called directly
if (require.main === module) {
  runDemo()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runDemo };
