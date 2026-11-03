
import Cart from '/assets/js/cart/cart.js';
import { renderCartSummary, bindCartEvents } from '/assets/js/cart/cart-usage.js';
import { checkoutPreflight } from '/assets/js/pages/checkout-preflight.js';
import { panelSwitchViews } from '/assets/js/utils/panel-switchViews.js';
import { updateUpcomingDates } from '/assets/js/utils/pills-updateUpcomingDates.js';
import { updateTotalSavings } from '/assets/js/pages/checkout-updateSavings.js';


const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);
const cart = new Cart({ products, storefront });

cart.load();
renderCartSummary(cart);
checkoutPreflight();
bindCartEvents(cart);
panelSwitchViews('shipping-collection', 'shipping-delivery');

document.addEventListener('cartChanged', (e) => {
  renderCartSummary(cart); //e.detail.cartInstance
  updateTotalSavings(cart);
});

document.addEventListener("DOMContentLoaded", () => {
  updateTotalSavings(cart);
  updateUpcomingDates("collection-pills-dates");
  updateUpcomingDates("delivery-pills-dates");
});

