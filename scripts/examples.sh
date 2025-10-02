#!/bin/bash

# Example Usage Script for Product Scraper
# This demonstrates how to use the scraper tool

# EXAMPLE 1: Basic usage - scrape from one URL
echo "Example 1: Scraping from a single URL"
echo "--------------------------------------"
echo "node scripts/scrape-products.js \\"
echo "  --urls \"https://www.woolworths.com.au/shop/browse/meat-seafood-deli\" \\"
echo "  --output src/_data/meat-scraped.json \\"
echo "  --count 25"
echo ""

# EXAMPLE 2: Scrape from multiple competing supermarkets
echo "Example 2: Scraping from multiple supermarkets"
echo "----------------------------------------------"
echo "node scripts/scrape-products.js \\"
echo "  --urls \"https://www.woolworths.com.au/shop/browse/meat-seafood-deli\" \\"
echo "         \"https://www.coles.com.au/browse/meat-seafood\" \\"
echo "  --output src/_data/meat.json \\"
echo "  --count 30"
echo ""

# EXAMPLE 3: Test with smaller dataset
echo "Example 3: Testing with smaller dataset"
echo "---------------------------------------"
echo "node scripts/scrape-products.js \\"
echo "  --urls \"https://www.woolworths.com.au/shop/browse/meat-seafood-deli\" \\"
echo "  --output /tmp/meat-test.json \\"
echo "  --count 10"
echo ""

# EXAMPLE 4: Just output to console (no file)
echo "Example 4: Output to console only"
echo "---------------------------------"
echo "node scripts/scrape-products.js \\"
echo "  --urls \"https://www.woolworths.com.au/shop/browse/meat-seafood-deli\""
echo ""

echo "Note: The examples above use real supermarket URLs."
echo "      Always check the website's robots.txt and Terms of Service"
echo "      before scraping. Consider using official APIs if available."
echo ""
echo "To run any of these examples, copy the command and execute it in your terminal."
