const openBtn = document.getElementById('btn-modalCart');
const closeBtn = document.getElementById('cart-modal-close');
const cartSummary = document.getElementById('cartSummary-modal');

const cartSummaryList = document.getElementById('cart-item-products');

//import { renderCartItems } from '../cart/renderCartItems.js';
//import { createModalCartItem } from '../cart/cartItemTemplates.js';
//import { updateCartSubtotal } from '../cart/utils.js';

export function renderCartSummaryModal(cart, subtotalElementId) {
  //renderCartItems(cartSummaryList, createModalCartItem);
  updateCartItemCount(cart);
  const subtotalEl = document.getElementById(subtotalElementId);
  if (subtotalEl) subtotalEl.textContent = cart.formatPrice(cart.totalCost);
  updateCartFooter(cart);
}

// Helper to get product data by SKU
export function getProductBySku(sku) {
  return products.find(p => p.productSku === sku);
}

export function onCartModalOpen(cart) {
  cart.load();
  renderCartSummaryModal(cart);
} 

function updateCartItemCount(cart) {
  const tallyElement = document.getElementById('cart-modal-tally');
  if (!tallyElement) return;

  const totalItems = cart.totalItems || 0;
  const label = totalItems === 1 ? 'item' : 'items';
  tallyElement.innerHTML = `<strong>${totalItems}</strong> ${label}`;
}

function updateCartFooter(cart) {
  const checkoutBtn = document.getElementById('cart-navigate-checkout');
  if (!checkoutBtn) return;

  if (cart.totalItems > 0) {
    checkoutBtn.removeAttribute('hidden');
  } else {
    checkoutBtn.setAttribute('hidden', '');
  }
}

export function openCartSummary(cart) {
  window.dispatchEvent(new Event('show-backdrop'));
  renderCartSummaryModal(cart);
  cartSummary.hidden = false;
  cartSummary.classList.remove('closed');
  cartSummary.classList.add('open');
}

export function closeCartSummary() {
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

// ESC key closes cartSummary
document.addEventListener('keydown', (e) => {
  if (!cartSummary.hidden && (e.key === "Escape" || e.key === "Esc")) {
    closeCartSummary();
  }
});
