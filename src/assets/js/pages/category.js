import Cart from '/assets/js/cart/cart.js';
import { bindOverlayEvents, updateHeaderBtn, updateOverlayUI } from '/assets/js/pages/cart-overlay.js';
import { renderCartSummary, bindCartEvents } from '/assets/js/cart/cart-usage.js';

const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);
const container = document.getElementById('products-grid');
const importProductCardsPath = `/assets/js/components/${storefront.storefrontType}/productCards.js`;
const cart = new Cart({ products, storefront });

cart.load();
cart.setUpdateHandler(updateHeaderBtn);
//initCartOverlay(cart);
updateHeaderBtn(cart);
renderCartSummary(cart);
bindOverlayEvents(cart);
bindCartEvents(cart);

import(importProductCardsPath).then(module => {
  module.renderProductCards(products, storefront, container);
});

document.addEventListener('cartChanged', (e) => {
  // e.detail.cartInstance is available
  renderCartSummary(e.detail.cartInstance);
  updateOverlayUI(e.detail.cartInstance);
});