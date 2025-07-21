const openBtn = document.getElementById('btn-modalCart');
const closeBtn = document.getElementById('cart-modal-close');
const cartSummary = document.getElementById('cartSummary-modal');

const cartSummaryList = document.getElementById('cart-item-products');

import { renderCartSummaryList } from '/js/cart/cart-usage.js';


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

export function onCartModalOpen(cart) {
  const freshCart = loadCartFromStorage();
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

function updateCartSubtotal(cart, subtotalId = 'cart-subtotal-amount') {
  // cart: cart object with items and their price/qty
  // id: the DOM element id where the subtotal should be updated
  const subtotal = Object.values(cart.items).reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
  const el = document.getElementById(subtotalId);
  if (el) {
    el.textContent = subtotal.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  }
  return subtotal;
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
  updateCartSummary(cart);
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

openBtn.addEventListener('click', () => {
  console.log("clicked");
  onCartModalOpen(cart);      // ← refresh cart summary with latest localStorage
  openCartSummary(cart);      // ← open the modal
});

// ESC key closes cartSummary
document.addEventListener('keydown', (e) => {
  if (!cartSummary.hidden && (e.key === "Escape" || e.key === "Esc")) {
    closeModal();
  }
});
