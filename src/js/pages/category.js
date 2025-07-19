const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);
const container = document.getElementById('products-grid');
const importProductCardsPath = `/js/components/${storefront.storefrontType}/productCards.js`;

import Cart from '/js/cart/cart.js';
import { updateCartUI } from '/js/cart/cart-usage.js';

const cart = new Cart({ products, storefront });
cart.load();
cart.setUpdateHandler(updateCartUI);
updateCartUI(cart);

import(importProductCardsPath).then(module => {
  module.renderProductCards(products, storefront, container);
});

document.addEventListener('click', function (e) {
  if (e.target.matches('.add-to-cart')) {
    const sku = e.target.dataset.sku;
    cart.addItem(sku, 1);
  }
});