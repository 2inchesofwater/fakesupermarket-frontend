const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);
const container = document.getElementById('products-grid');
const importProductCardsPath = `/js/components/${storefront.storefrontType}/productCards.js`;

import Cart from '/js/cart/cart.js'; // Adjust path as needed

const cart = new Cart({ products, storefront });
cart.load();
cart.setUpdateHandler(updateCartUI);

function updateCartUI(cartInstance) {
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
}

import(importProductCardsPath).then(module => {
  module.renderProductCards(products, container);
});
