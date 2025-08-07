const cartOverlayBtnOpen = document.getElementById('header-cartBtn');
const cartHeaderBtn_subtotal = document.getElementById('header-cartBtn-subtotal');
const cartHeaderBtn_badge = document.getElementById('header-cartBtn-badge');
const cartHeaderBtn_tally = document.getElementById('header-cartBtn-tally');

const cartOverlay = document.getElementById('cart-overlay');
const cartOverlayTally = document.getElementById('cart-overlay-tally');
const cartOverlayBtnClose = document.getElementById('cart-overlay-btn-close');
const cartOverlayBtnCheckout = document.getElementById('cart-overlay-btn-checkout');
const cartOverlayBtnContinue = document.getElementById('cart-continue-shopping');

import { renderCartSummary, renderCartSummaryList } from '/js/cart/cart-usage.js';

export function updateOverlayUI(cartInstance) {
  updateHeaderBtn(cartInstance);
  updateCartItemCount(cartInstance);
  
  if (Object.keys(cartInstance.items).length === 0) {
    activateCheckoutBtn(cartInstance);
  }
}

export function updateHeaderBtn(cartInstance) {
  if (cartHeaderBtn_badge) {
    if (cartInstance.totalItems > 0) {
      cartHeaderBtn_badge.hidden = false;
      cartHeaderBtn_badge.textContent = cartInstance.totalItems;
    } else {
      cartHeaderBtn_badge.textContent = '';
      cartHeaderBtn_badge.hidden = true;
    }
  }
  if (cartHeaderBtn_tally) cartHeaderBtn_tally.textContent = cartInstance.totalItems;
  if (cartHeaderBtn_subtotal) cartHeaderBtn_subtotal.textContent = cartInstance.formatPrice(cartInstance.totalCost);

  if (cartOverlay && !cartOverlay.hidden) {
    renderCartSummaryList(cartInstance);
  }
  return;
}

export function openCartOverlay(cartInstance) {
  const freshCart = cartInstance.load();
  Object.assign(cartInstance, freshCart);

  window.dispatchEvent(new Event('show-backdrop'));
  cartOverlay.hidden = false;
  cartOverlay.classList.remove('closed');
  cartOverlay.classList.add('open');

  renderCartSummary(cartInstance);
  activateCheckoutBtn(cartInstance);
}

export function closeCartSummary() {
  window.dispatchEvent(new Event('hide-backdrop'));
  cartOverlay.classList.remove('open');
  cartOverlay.classList.add('closed');
  // Listen for animation end
  cartOverlay.addEventListener('transitionend', handleTransitionEnd);
}


export function updateCartItemCount(cartInstance) {
  if (!cartOverlayTally) return;

  const totalItems = cartInstance.totalItems || 0;
  const label = totalItems === 1 ? 'item' : 'items';
  cartOverlayTally.innerHTML = `<strong>${totalItems}</strong> ${label}`;
}


export function activateCheckoutBtn(cartInstance) {
    if (!cartOverlayBtnCheckout) {
      console.error("Checkout button not found in DOM");
      return;
    }
  if (cartInstance.totalItems > 0) {
    cartOverlayBtnCheckout.removeAttribute('hidden');
  } else {
    cartOverlayBtnCheckout.setAttribute('hidden', '');
  }
}

export function bindOverlayEvents(cartInstance) {
  document.addEventListener('DOMContentLoaded', () => {
    if (!cartOverlayBtnOpen) {
      console.error("Cart open button not found in DOM");
      return;
    }
    cartOverlayBtnOpen.addEventListener('click', () => {
      openCartOverlay(cartInstance);
    });
  });
}

function handleTransitionEnd(e) {
  if ((e.propertyName === 'transform') && cartOverlay.classList.contains('closed')) {
    cartOverlay.hidden = true;
    cartOverlay.removeEventListener('transitionend', handleTransitionEnd);
    cartOverlay.classList.remove('closed');
  }
}

cartOverlayBtnContinue?.addEventListener('click', closeCartSummary);
cartOverlayBtnClose.addEventListener('click', closeCartSummary);

// ESC key closes cartSummary
document.addEventListener('keydown', (e) => {
  if (!cartOverlay.hidden && (e.key === "Escape" || e.key === "Esc")) {
    closeCartSummary();
  }
});
