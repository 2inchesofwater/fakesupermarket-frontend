const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);
const container = document.getElementById('products-grid');
const importProductCardsPath = `/js/components/${storefront.storefrontType}/productCards.js`;

import Cart from '/js/cart/cart.js'; 

const cart = new Cart({ products, storefront });
cart.load();
cart.setUpdateHandler(updateCartUI);

import(importProductCardsPath).then(module => {
  module.renderProductCards(products, storefront, container);
});

