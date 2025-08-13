import Cart from '/js/cart/cart.js';
import { renderCartSummary, bindCartEvents } from '/js/cart/cart-usage.js';
import { updateUpcomingDates } from '/js/utils/pills-updateUpcomingDates.js';

const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);
const cart = new Cart({ products, storefront });

cart.load();
renderCartSummary(cart);
bindCartEvents(cart);

document.addEventListener("DOMContentLoaded", () => {
  updateUpcomingDates("collection-pills-dates");
  updateUpcomingDates("delivery-pills-dates");
});


