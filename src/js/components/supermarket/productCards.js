/**
 * Renders product cards at run-time, as a replacement for the original Nunjucks template.
 * 
 * Assumes:
 * - `products` is an array of product objects (from embedded JSON)
 * - `storefront` is an object containing all necessary config (like currencySymbol, slug, etc.)
 * - SVG icons (if any) are handled externally; this code will leave placeholders for icons
 * 
 * Usage:
 *   renderProductCards(products, storefront, document.getElementById('product-list'))
 */
export function renderProductCards(products, storefront, productsGrid) {

  productsGrid.innerHTML = products.map(product => {
    // Product image logic
  console.table( storefront );

    const hasImage = !!(product.images);


    const imageSection = hasImage ? `
      <div class="productCard-image">
        <img
          src="pages/${storefront.slug}/${product.images}"
          ${product.imagesVisualDescription
            ? `alt="${escapeHtml(product.productName)} - Product image showing ${escapeHtml(product.imagesVisualDescription)}"`
            : ""}
          class="product-image"
          width="${storefront.productCardImageSize.width}"
          height="${storefront.productCardImageSize.height}"
          loading="lazy"
        >
        ${product.priceCurrent
          ? `<div class="overlay overlay-text productCard-overlay
                ${storefront.productCardShowOverlayOnLeft === false ? "productCardOverlay-alignRight" : ""}
                ${storefront.productCardShowOverlayAtTop === false ? "productCardOverlay-alignBottom" : ""}"
                aria-label="Special offer"><span class="overlay-label">SPECIAL</span></div>`
          : ""}
      </div>
    ` : "";

    // Identification info
    const badge = product.badgeLabel
      ? `<div class="badge ${escapeHtml(product.badgeClassName)}" aria-label="Brand">${escapeHtml(product.badgeLabel)}</div>` : "";
    const brand = storefront.productCardShowBrands
      ? `<div class="product-brand" aria-label="Brand">${escapeHtml(product.productBrand)}</div>` : "";
    const grossWeight = storefront.productCardShowGrossWeight
      ? `<div class="product-grossWeight">${escapeHtml(product.productGrossWeight)}</div>` : "";
    const shortDesc = storefront.productCardShowShortDescription
      ? `<div class="product-shortDescription" aria-label="Short description:">${escapeHtml(product.descriptionShort)}</div>` : "";
    const longDesc = storefront.productCardShowLongDescription
      ? `<div class="product-longDescription" aria-label="Longer description:">${escapeHtml(product.descriptionLong)}</div>` : "";

    // Pricing logic
    const showSaveBadge = product.priceCurrent && product.priceCurrent < product.priceRrp;
    const saveBadge = showSaveBadge
      ? `<div class="badge badge-positive">
          Save ${storefront.currencySymbol}${(product.priceRrp - product.priceCurrent).toFixed(2)}
        </div>` : "";
    const currentPrice = product.priceCurrent ? product.priceCurrent : product.priceRrp;
    const priceCurrent = `<div class="product-price-current" aria-label="Current price:">
      ${storefront.currencySymbol}${currentPrice}
    </div>`;
    const priceRrp = product.priceCurrent
      ? `<div class="product-price-rrp strikethrough" aria-label="Recommended retail price">
          <del aria-label="Original price:">${storefront.currencySymbol}${product.priceRrp}</del>
        </div>` : "";
    const unitPrice = storefront.productCardShowUnitPrice
      ? `<div class="product-price-unit" aria-label="Unit price per weight">
          ${storefront.currencySymbol}${product.pricePerUnit}/${escapeHtml(product.productPerUnit)}
        </div>` : "";
    const priceInfoSeparator = (product.priceCurrent && storefront.productCardShowUnitPrice)
      ? `<div class="separator" aria-hidden> • </div>` : "";

    // Featured label
    const featuredLabel = product.featuredLabel
      ? `<div class="badge badge-naked">${escapeHtml(product.featuredLabel)}</div>` : "";

    // Ratings
    const ratings = (product.rating && storefront.productCardShowRatings) ? `
      <div class="productCard-ratings">
        <div class="product-rating" aria-label="Product rated ${product.productAverageRating} out of 5 stars based on ${product.productCountRatings} reviews">
          <div class="product-rating-count">
            Ratings <strong>${product.rating}</strong> (${product.reviews_count})
          </div>
        </div>
      </div>
    ` : "";

    // Add to cart and favorite buttons (icons are left as placeholders)
    const cartPrice = product.priceCurrent ? product.priceCurrent : product.priceRrp;
    const addToCartIcon = storefront.productCardAddIconFilename
      ? `<span class="icon icon-add-to-cart"></span>` // Placeholder: replace with SVG logic if needed
      : "";
    const addToCartLabel = storefront.productCardAddLabel
      ? `${escapeHtml(storefront.productCardAddLabel)}`
      : "Add to cart";
    const saveToListIcon = storefront.productCardSaveIconFilename
      ? `<span class="icon icon-save-to-list"></span>`
      : "";
    const saveToListLabel = storefront.productCardSaveLabel
      ? `${escapeHtml(storefront.productCardSaveLabel)}`
      : "Save to list";

    return `
      <div id="${escapeHtml(product.productSku)}" class="product-card ${escapeHtml(product.productBrand)}" role="group" aria-labelledby="product-name-${escapeHtml(product.productSku)}">
        ${imageSection}
        <div class="productCard-info">
          <div class="productCard-identification">
            ${badge}
            ${brand}
            <h3 class="product-name" id="product-name-${escapeHtml(product.productSku)}">
              <a href="pages/${storefront.slug}/${product.productSlug}.html">${escapeHtml(product.productName)}</a>
            </h3>
            ${grossWeight}
            ${shortDesc}
            ${longDesc}
          </div>
          <div class="productCard-pricing">
            ${saveBadge}
            ${priceCurrent}
            <div class="product-price-info">
              ${priceRrp}
              ${priceInfoSeparator}
              ${unitPrice}
            </div>
          </div>
          ${featuredLabel}
          ${ratings}
        </div>
        <div class="productCard-actions">
          <button
            class="add-to-cart btn btn-product btn-primary"
            data-sku="${escapeHtml(product.productSku)}" data-price="${cartPrice}"
            aria-label="Add ${escapeHtml(product.productName)} to your cart"
            onclick="addToCart(this)">
            ${addToCartIcon} ${addToCartLabel}
          </button>
          <button
            class="favorite-button btn btn-product btn-secondary"
            aria-label="Come back to ${escapeHtml(product.productName)} later"
            onclick="toggleFavorite(this)">
            ${saveToListIcon} ${saveToListLabel}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Simple HTML-escape helper to prevent XSS with product data
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
