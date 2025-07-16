// js/pages/checkout.js

import { renderCartItems } from '../cart/renderCartItems.js';
import { createCheckoutCartItem } from '../cart/cartItemTemplates.js';
import { updateCartSubtotal } from '../cart/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const checkoutList = document.getElementById('checkout-cart-items');
  if (!checkoutList) return;

  renderCartItems(checkoutList, createCheckoutCartItem);
  updateCartSubtotal(localCart, 'checkout-subtotal');
});