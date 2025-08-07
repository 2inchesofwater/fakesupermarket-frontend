import Cart from '/js/cart/cart.js';
import { bindOverlayEvents, updateHeaderBtn, updateOverlayUI } from '/js/pages/cart-overlay.js';
import { renderCartSummary, bindCartEvents } from '/js/cart/cart-usage.js';

const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);
const cart = new Cart({ products, storefront });

cart.load();
cart.setUpdateHandler(updateHeaderBtn);
updateHeaderBtn(cart);
renderCartSummary(cart);
bindOverlayEvents(cart);
bindCartEvents(cart);

document.addEventListener('cartChanged', (e) => {
  // e.detail.cartInstance is available
  renderCartSummary(e.detail.cartInstance);
  updateOverlayUI(e.detail.cartInstance);
});