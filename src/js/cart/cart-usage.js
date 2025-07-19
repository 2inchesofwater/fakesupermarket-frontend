
// Load cart from storage on page load
cart.load();

// Update UI whenever cart changes
cart.setUpdateHandler(updateCartUI);

// Example UI update function
export function updateCartUI(cartInstance) {
  // Update cart badge/tally in header
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

  // You can also refresh the modal/overlay cart summary here
  // renderCartSummaryList(cartInstance);
}

// Wire up "Add to cart" button(s)
document.addEventListener('click', function (e) {
  if (e.target.matches('.add-to-cart')) {
    const sku = e.target.dataset.sku;
    cart.addItem(sku, 1);
  }
});

// Wire up quantity controls in cart summary/checkout
document.addEventListener('click', function (e) {
  if (e.target.matches('.control-plus')) {
    const sku = e.target.closest('.cart-item-product')?.id?.replace('cart-item-product-', '');
    if (sku) cart.addItem(sku, 1);
  }
  if (e.target.matches('.control-minus')) {
    const sku = e.target.closest('.cart-item-product')?.id?.replace('cart-item-product-', '');
    if (sku && cart.items[sku]) cart.updateItemQuantity(sku, cart.items[sku].quantity - 1);
  }
  if (e.target.matches('.btn-variant-recessive')) { // Remove item
    const sku = e.target.closest('.cart-item-product')?.id?.replace('cart-item-product-', '');
    if (sku) cart.removeItem(sku);
  }
  if (e.target.matches('.btn-remove-all')) { // Remove all items (confirmation dialog)
    if (window.confirm('Remove all items from cart?')) cart.removeAll();
  }
});

// Wire up quantity input fields
document.addEventListener('change', function (e) {
  if (e.target.matches('input[type="number"][name^="control-product-quantity-input-"]')) {
    const sku = e.target.name.replace('control-product-quantity-input-', '');
    const val = parseInt(e.target.value, 10);
    if (sku && !isNaN(val)) cart.updateItemQuantity(sku, val);
  }
});

// Example: Render cart items in modal/summary
export function renderCartSummaryList(cartInstance) {
  const container = document.getElementById('cart-modal-items');
  container.innerHTML = '';
  for (const [sku, item] of Object.entries(cartInstance.items)) {
    const product = cartInstance.getProductBySku(sku);
    if (product) {
      const li = document.createElement('li');
      li.textContent = `${product.productName} x ${item.quantity} = ${cartInstance.formatPrice((product.priceCurrent ?? product.priceRrp) * item.quantity)}`;
      container.appendChild(li);
    }
  }
  // Show/hide empty message
  const emptyMessage = document.getElementById('cart-message-empty');
  if (Object.keys(cartInstance.items).length === 0) {
    container.hidden = true;
    emptyMessage.hidden = false;
  } else {
    container.hidden = false;
    emptyMessage.hidden = true;
  }
}

// You can call renderCartSummaryList(cart) inside updateCartUI if you want summary list to refresh whenever cart changes

// On initial load, trigger UI update
updateCartUI(cart);