const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);

import Cart from '/js/cart/cart.js'; 
import { updateCartUI } from '/js/cart/cart-usage.js';

cart.load();
cart.setUpdateHandler(updateCartUI);

