import { createModalCartItem } from '/js/cart/cartItemTemplates.js';

const cartSummary = document.getElementById('cartSummary-modal');
const cartItemsBody = document.getElementById('cart-overlay-items');
const cartItemsEmptyMessage = document.getElementById('cart-message-empty');
const cartItemsList = document.getElementById('cart-products');
const subtotalAmount = document.getElementById('cart-subtotal-amount');

// UI update function 
export function updateCartUI(cartInstance) {
  const badge = document.querySelector('.badge.badge-tally');
  const tally = document.getElementById('cart-tally');
  const totalEl = document.getElementById('cart-total');

  if (badge) {
    if (cartInstance.totalItems > 0) {
      badge.hidden = false;
      badge.textContent = cartInstance.totalItems;
    } else {
      badge.textContent = '';
      badge.hidden = true;
    }
  }
  if (tally) tally.textContent = cartInstance.totalItems;
  if (totalEl) totalEl.textContent = cartInstance.formatPrice(cartInstance.totalCost);

  if (cartSummary && !cartSummary.hidden) {
    renderCartSummaryList(cartInstance);
  }
}

// Example: Render cart items in modal/summary
export function renderCartSummaryList(cartInstance) {
  cartItemsList.innerHTML = '';
  for (const sku of Object.keys(cartInstance.items)) {
    const li = createModalCartItem(cartInstance, sku);
    if (li) {
      cartItemsList.appendChild(li);
    }
  }
  // Show/hide empty message
  if (Object.keys(cartInstance.items).length === 0) {
    cartItemsBody.hidden = true;
    cartItemsEmptyMessage.hidden = false;
  } else {
    cartItemsBody.hidden = false;
    cartItemsEmptyMessage.hidden = true;
  }
}

// Wire up quantity controls in cart summary/checkout
document.addEventListener('click', function (e) {
  let cartChanged = false;
  if (e.target.matches('.control-plus')) {
    console.log('added');
    const sku = e.target.closest('.cart-item-product')?.id?.replace('cart-item-product-', '');
    if (sku) {
      cart.addItem(sku, 1);
      cartChanged = true;
    }
  }
  if (e.target.matches('.control-minus')) {
    const sku = e.target.closest('.cart-item-product')?.id?.replace('cart-item-product-', '');
    if (sku && cart.items[sku]) {
      cart.updateItemQuantity(sku, cart.items[sku].quantity - 1);
      cartChanged = true;
    }
  }
  if (e.target.matches('.btn-variant-recessive')) { // Remove item
    const sku = e.target.closest('.cart-item-product')?.id?.replace('cart-item-product-', '');
    if (sku) {
      cart.removeItem(sku);
      cartChanged = true;
    }
  }
  if (e.target.matches('.btn-remove-all')) { // Remove all items (confirmation dialog)
    if (window.confirm('Remove all items from cart?')) {
      cart.removeAll();
      cartChanged = true;
    }
  }
  if (cartChanged) updateCartUI(cart);
});

// Wire up quantity input fields
document.addEventListener('change', function (e) {
  if (e.target.matches('input[type="number"][name^="control-product-quantity-input-"]')) {
    const sku = e.target.name.replace('control-product-quantity-input-', '');
    const val = parseInt(e.target.value, 10);
    if (sku && !isNaN(val)) {
      cart.updateItemQuantity(sku, val);
      updateCartUI(cart);
    }
  }
});


