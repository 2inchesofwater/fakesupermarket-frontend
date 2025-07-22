import Cart from '/js/cart/cart.js';
import { updateCartUI, bindCartEvents } from '/js/cart/cart-usage.js';
import { renderCartSummaryModal } from '/js/pages/cart-overlay.js';

const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);
const cart = new Cart({ products, storefront });

cart.load();
cart.setUpdateHandler(updateCartUI);
//initCartOverlay(cart);
updateCartUI(cart);
renderCartSummaryList(cart);