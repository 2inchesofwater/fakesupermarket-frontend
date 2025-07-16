const openBtn = document.getElementById('btn-modalCart');
const closeBtn = document.getElementById('cart-modal-close');
const cartSummary = document.getElementById('cartSummary-modal');

const cartSummaryList = document.getElementById('cart-item-products');




import { renderCartItems } from '../cart/renderCartItems.js';
import { createModalCartItem } from '../cart/cartItemTemplates.js';


function renderCartSummaryModal() {
  renderCartItems(cartSummaryList, createModalCartItem);
  updateCartItemCount();
  updateCartSubtotal();
  updateCartFooter();
}

// Helper to get product data by SKU
function getProductBySku(sku) {
  return products.find(p => p.productSku === sku);
}


// Modified to accept quantity from cart
function createCartItem(product, quantity) {
  const currency = storefront.currencySymbol || '$';
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
              <div class="badge badge-positive">Save ${currency}${savings}</div>
            </div>
            <div class="cart-item-pricing-rrp">
              <span>Was ${currency}${parseFloat(product.priceRrp).toFixed(2)}</span>
            </div>
          ` : ''}
        </div>
        <div class="cart-item-subtotal">
          ${currency}${(parseFloat(price) * quantity).toFixed(2)}
        </div>
      </div>
    </div>
  `;

  li.querySelector('.intent-removeItem').appendChild(cloneIconTemplate('icon-x'));
  li.querySelector('.intent-minusItem').appendChild(cloneIconTemplate('icon-minus'));
  li.querySelector('.intent-plusItem').appendChild(cloneIconTemplate('icon-plus'));

  return li;
}

function onCartModalOpen() {
  const freshCart = loadCartFromStorage();
  Object.assign(cart, freshCart);
  renderCartSummary();
} 

function updateCartItemCount() {
  const tallyElement = document.getElementById('cart-modal-tally');
  if (!tallyElement) return;

  const totalItems = cart.totalItems || 0;
  const label = totalItems === 1 ? 'item' : 'items';
  tallyElement.innerHTML = `<strong>${totalItems}</strong> ${label}`;
}

function updateCartSubtotal() {
  const currency = storefront.currencySymbol || '$';
  const subtotalElement = document.getElementById('cart-subtotal-amount');

  if (!subtotalElement) return;

  const subtotal = parseFloat(cart.totalCost || 0).toFixed(2);
  subtotalElement.textContent = `${currency}${subtotal}`;
}

function updateCartFooter() {
  const checkoutBtn = document.getElementById('cart-navigate-checkout');
  if (!checkoutBtn) return;

  if (cart.totalItems > 0) {
    checkoutBtn.removeAttribute('hidden');
  } else {
    checkoutBtn.setAttribute('hidden', '');
  }
}

function openCartSummary() {
  window.dispatchEvent(new Event('show-backdrop'));
  updateCartSummary(cart);
  cartSummary.hidden = false;
  cartSummary.classList.remove('closed');
  cartSummary.classList.add('open');
}

function closeCartSummary() {
  window.dispatchEvent(new Event('hide-backdrop'));
  cartSummary.classList.remove('open');
  cartSummary.classList.add('closed');
  // Listen for animation end
  cartSummary.addEventListener('transitionend', handleTransitionEnd);
}

function handleTransitionEnd(e) {
  if ((e.propertyName === 'transform') && cartSummary.classList.contains('closed')) {
    cartSummary.hidden = true;
    cartSummary.removeEventListener('transitionend', handleTransitionEnd);
    cartSummary.classList.remove('closed');
  }
}

const continueBtn = document.getElementById('cart-continue-shopping');
continueBtn?.addEventListener('click', closeCartSummary);
closeBtn.addEventListener('click', closeCartSummary);
openBtn.addEventListener('click', () => {
  onCartModalOpen();      // ← refresh cart summary with latest localStorage
  openCartSummary();      // ← open the modal
});

// ESC key closes cartSummary
document.addEventListener('keydown', (e) => {
  if (!cartSummary.hidden && (e.key === "Escape" || e.key === "Esc")) {
    closeModal();
  }
});


// Initial render
document.addEventListener('DOMContentLoaded', () => {
  renderCartSummaryModal();
});
