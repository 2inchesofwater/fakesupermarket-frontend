// Expects: cart = Cart instance, sku = string
// Does NOT bind events—just returns the DOM node.

import { cloneIconTemplate } from '/js/utils/cloneIcon.js'; 

export function createBaseCartItem(cart, sku) {
  const item = cart.items[sku];
  if (!item) return null;
  const product = cart.getProductBySku(sku);
  if (!product) return null;
  const quantity = item.quantity;
  const price = product.priceCurrent ?? product.priceRrp;
  const savings = product.priceRrp && product.priceCurrent
    ? (parseFloat(product.priceRrp) - parseFloat(product.priceCurrent)).toFixed(2)
    : null;

  const li = document.createElement('li');
  li.className = 'cart-item-product';
  li.id = `cart-item-product-${product.productSku}`;
  li.setAttribute('aria-labelledby', `product-${product.productSku}`);

  li.innerHTML = `
    <div class="cart-item-thumbnail">
      <img 
        src="/pages/${cart.storefront.slug}/${product.images}" 
        alt="${product.imagesVisualDescription || product.productName}" 
        width="${cart.storefront.productCardImageSize.width}" 
        height="${cart.storefront.productCardImageSize.height}"
        loading="lazy" fetchpriority="low">
    </div>
    <div class="cart-item-details">
      <div class="cart-item-headline">
        <h3 id="product-${product.productSku}" class="cart-item-headline-productName">
          <a href="/product/${product.productSlug}">${product.productName}</a>
        </h3>
      </div>

      <div class="cart-item-subtotal">${cart.formatPrice(price * quantity)}</div>

      <div class="cart-item-savings">
        ${savings ? `
          <div class="cart-item-pricing-savings">
            <div class="badge badge-positive">Save ${cart.formatPrice(savings)}</div>
          </div>
          <div class="cart-item-pricing-rrp">
            <span>Was ${cart.formatPrice(product.priceRrp)}</span>
          </div>
        ` : ''}
      </div> 

      <!-- <div class="cart-item-messages" hidden></div> -->
        <!-- In case we need to add in text such as "Out of stock" or "Promoted" -->

      <div class="cart-item-controls">
        <div class="control-product-quantity">
          <button class="control control-minus">
            <span class="sr-only">Decrease quantity</span>
            <div class="intent-minusItem"></div>
          </button>
          <input name="control-product-quantity-input-${product.productSku}" type="number" value="${quantity}" min="0" step="1">
          <button class="control control-plus">
            <span class="sr-only">Increase quantity</span>
            <div class="intent-plusItem"></div>
          </button>
        </div>
        <button class="control-remove">
          Remove <span class="sr-only">${product.productName}</span>
        </button>
      </div>
    </div>
  `;

  return li;
}

export function createModalCartItem(cart, sku) {
  const li = createBaseCartItem(cart, sku);
  if (!li) return null;

  li.querySelector('.intent-minusItem')?.appendChild(cloneIconTemplate('icon-minus'));
  li.querySelector('.intent-plusItem')?.appendChild(cloneIconTemplate('icon-plus'));
  // To-do: Replace the JS cloneIcon function with SVG symbols

  return li;
}

export function createResearchCartItem(cart, sku) {
  // Get the base cart item DOM node
  const li = createBaseCartItem(cart, sku);
  if (!li) return null;

  // Replace the <a> in the product name with a <span>
  const headline = li.querySelector('.cart-item-headline-productName a');
  if (headline) {
    const span = document.createElement('span');
    span.textContent = headline.textContent;
    headline.parentNode.replaceChild(span, headline);
  }

  const hiddenSku = document.createElement('input');
  hiddenSku.type = 'hidden';
  hiddenSku.name = `interview_product_sku`;
  hiddenSku.value = sku;
  li.appendChild(hiddenSku);

  // Remove the quantity controls and remove button
  const controls = li.querySelector('.cart-item-controls');
  if (controls) {
    controls.parentNode.removeChild(controls);
  }

  return li;
}
