// js/cart/cartItemTemplates.js

function formatPrice(amount) {
  return `${storefront.currencySymbol || '$'}${parseFloat(amount).toFixed(2)}`;
}

function createBaseCartItem(product, quantity) {
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
        src="pages/${storefront.slug}/${product.images}" 
        alt="${product.imagesVisualDescription || product.productName}" 
        width="${storefront.productCardImageSize.width}" 
        height="${storefront.productCardImageSize.height}">
    </div>
    <div class="cart-item-details">
      <div class="cart-item-headline">
        <h3 id="product-${product.productSku}" class="cart-item-headline-productName">
          <a href="/product/${product.productSlug}">${product.productName}</a>
        </h3>
        <button class="btn btn-icon btn-variant-recessive">
          <span class="sr-only">Remove ${product.productName}</span>
          <div class="intent-removeItem"></div>
        </button>
      </div>
      <div class="cart-item-messages" hidden></div>
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
        <div class="cart-item-pricing">
          ${savings ? `
            <div class="cart-item-pricing-savings">
              <div class="badge badge-positive">Save ${formatPrice(savings)}</div>
            </div>
            <div class="cart-item-pricing-rrp">
              <span>Was ${formatPrice(product.priceRrp)}</span>
            </div>
          ` : ''}
        </div>
        <div class="cart-item-subtotal">${formatPrice(price * quantity)}</div>
      </div>
    </div>
  `;

  return li;
}

export function createModalCartItem(product, quantity) {
  const li = createBaseCartItem(product, quantity);

  li.querySelector('.intent-removeItem')?.appendChild(cloneIconTemplate('icon-x'));
  li.querySelector('.intent-minusItem')?.appendChild(cloneIconTemplate('icon-minus'));
  li.querySelector('.intent-plusItem')?.appendChild(cloneIconTemplate('icon-plus'));

  return li;
}

export function createCheckoutCartItem(product, quantity) {
  const li = createBaseCartItem(product, quantity);

  const extra = document.createElement('div');
  extra.className = 'checkout-cart-item-extra';
  extra.innerHTML = `<label><input type="checkbox"> Add gift wrap</label>`;

  li.querySelector('.cart-item-details')?.appendChild(extra);

  return li;
}
