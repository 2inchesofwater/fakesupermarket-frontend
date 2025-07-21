const openBtn = document.getElementById('btn-modalCart');
const closeBtn = document.getElementById('cart-modal-close');
const cartSummary = document.getElementById('cartSummary-modal');

const cartSummaryList = document.getElementById('cart-item-products');

import { renderCartSummaryList, updateCartUI } from '/js/cart/cart-usage.js';


export function renderCartSummaryModal(cart) {
  renderCartSummaryList(cart, cartSummaryList);
  updateCartItemCount(cart);
  updateCartSubtotal(cart, 'cart-subtotal-amount');
  updateCartFooter(cart);
}

// Helper to get product data by SKU
export function getProductBySku(sku) {
  return products.find(p => p.productSku === sku);
}

export function updateCartSubtotal(cart, targetElementId) {
  const subtotalElement = document.getElementById(targetElementId);
  if (!subtotalElement) return;

  const currency = storefront.currencySymbol || '$';
  const subtotal = parseFloat(cart.totalCost || 0).toFixed(2);

  subtotalElement.textContent = cart.formatPrice(cart.totalCost);
}

export function onCartModalOpen(cart) {
  const freshCart = cart.load();
  Object.assign(cart, freshCart);
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

export function initCartOverlay(cart) {
  openBtn.addEventListener('click', () => {
    onCartModalOpen(cart);      // ← refresh cart summary with latest localStorage
    openCartSummary(cart);      // ← open the modal
  });
}

// ESC key closes cartSummary
document.addEventListener('keydown', (e) => {
  if (!cartSummary.hidden && (e.key === "Escape" || e.key === "Esc")) {
    closeCartSummary();
  }
});
