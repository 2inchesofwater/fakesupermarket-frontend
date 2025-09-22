
import Cart from '/js/cart/cart.js';
import { renderCartSummary, bindCartEvents } from '/js/cart/cart-usage.js';
import { checkoutPreflight } from '/js/pages/checkout-preflight.js';
import { panelSwitchViews } from '/js/utils/panel-switchViews.js';
import { updateUpcomingDates } from '/js/utils/pills-updateUpcomingDates.js';
import { updateTotalSavings } from '/js/pages/checkout-updateSavings.js';


const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);
const cart = new Cart({ products, storefront });

cart.load();
renderCartSummary(cart);
checkoutPreflight();
bindCartEvents(cart);
panelSwitchViews('shipping-collection', 'shipping-delivery');

document.addEventListener('cartChanged', (e) => {
  renderCartSummary(e.detail.cartInstance);
});

document.addEventListener("DOMContentLoaded", () => {
  updateTotalSavings(cart);
  updateUpcomingDates("collection-pills-dates");
  updateUpcomingDates("delivery-pills-dates");
});

