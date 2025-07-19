const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);

import Cart from '/js/cart/cart.js';
import { updateCartUI } from '/js/cart/cart-usage.js';

const cart = new Cart({ products, storefront });
cart.load();
cart.setUpdateHandler(updateCartUI);
updateCartUI(cart);

document.addEventListener('click', function (e) {
  if (e.target.matches('.add-to-cart')) {
    const sku = e.target.dataset.sku;
  	console.log('SKU in productDetails.js:', sku, typeof sku);
    cart.addItem(sku, 1);
  }
});