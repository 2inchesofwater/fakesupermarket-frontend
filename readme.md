## Development Workflow

### 1. Start Kirby CMS

```bash
# Navigate to your Kirby installation directory
cd path/to/kirby

# If using PHP's built-in server
php -S localhost:8000 kirby/router.php

```

### 2. Start the Eleventy frontend

```bash
# In a separate terminal, in your Eleventy project directory
npm start
```

This will:
- Start Eleventy on http://localhost:8080
- Watch for CSS changes and recompile
- Watch for JS changes and rebundle
- Fetch content from Kirby API (localhost:8000)



## Project Architecture

- **Frontend**: Eleventy with Nunjucks templates and modern CSS
- **Backend**: Kirby CMS providing content via API
- **Build System**: Gulp for task automation

## Setup and Installation

### Prerequisites

- Node.js (14.x or higher)
- PHP 8.0 or higher (for Kirby CMS)
- Web server (Apache, Nginx, etc.) for running Kirby

### Install Dependencies

```bash
# Install npm dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```
KIRBY_API_URL=http://localhost:8000/api
KIRBY_API_USERNAME=your-local-username
KIRBY_API_PASSWORD=your-local-password
```


## Project Structure

```
fakesupermarket-frontend/
├── .eleventy.js      # Eleventy configuration
├── gulpfile.js       # Gulp tasks definition
├── src/              # Source files
│   ├── _data/        # Data files
│   │   ├── _kirbyApi.js       # Kirby API helper
│   │   ├── products.js        # Product data from Kirby
│   │   ├── site.js            # Site data from Kirby
│   │   └── ...
│   ├── _includes/    # Template partials and components
│   │   ├── layouts/  # Base layouts
│   │   ├── components/ # Reusable components
│   │   └── partials/ # Page sections
│   ├── css/          # CSS files
│   ├── js/           # JavaScript files
│   ├── images/       # Image assets
│   │   └── products/ # Product images
│   └── *.njk         # Template files
└── _site/            # Generated site
```

## Build for Production

To build the site for production:

```bash
npm run build
```

This will:
- Generate optimized CSS
- Bundle and minify JS
- Build all pages with production settings

The generated site will be in the `_site` directory, ready for deployment.

## Working with Content

### Content Model

Products in Kirby are structured as follows:
- id: Unique identifier
- name: Product name
- description: Product description
- price: Product price
- image: Path to main product image
- gallery: Array of additional images
- category: Product category
- featured: Boolean indicating if the product is featured
- stock: Number of items in stock

### Adding Products

Add test products through the Kirby Panel at http://localhost:8000/panel

### Automated Product Scraping

For quickly populating product data from rival supermarket websites, you can use the automated scraper tool:

```bash
node scripts/scrape-products.js \
  --urls "https://example-supermarket.com/meat" \
  --output src/_data/meat.json \
  --count 25
```

See [scripts/README.md](scripts/README.md) for detailed documentation on using the product scraper.

## Troubleshooting

### CORS Issues

If experiencing CORS errors when the frontend tries to fetch from Kirby, ensure your Kirby config.php includes:

```php
return [
  'api' => [
    'allowOrigin' => [
      'http://localhost:8080'  // Your Eleventy development server
    ]
  ]
];
```

### API Authentication

If API requests are failing, check that your .env file has the correct credentials for your Kirby installation.