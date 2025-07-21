// js/pages/checkout.js

import Cart from '/js/cart/cart.js';
import { updateCartUI } from '/js/cart/cart-usage.js';

const cart = new Cart({ products, storefront });
cart.load();
cart.setUpdateHandler(updateCartUI);

document.addEventListener('DOMContentLoaded', () => {
  const checkoutList = document.getElementById('checkout-cart-items');
  if (!checkoutList) return;

  renderCartItems(checkoutList, createCheckoutCartItem);
  updateCartSubtotal(localCart, 'checkout-subtotal');
});