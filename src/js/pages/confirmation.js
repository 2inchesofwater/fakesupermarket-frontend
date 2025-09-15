import Cart from '/js/cart/cart.js';
import { renderCartSummary, bindCartEvents } from '/js/cart/cart-usage.js';
import { outputCartTotal, outputCartTally } from '/js/utils/output-cartTotal.js';
import { tablePurchasedItems } from '/js/utils/table-purchasedItems.js';
import { outputCartSavings, outputSalesTax } from '/js/utils/output-cartPriceAdjustments.js';
import { outputPaymentMethodTotal } from '/js/utils/output-paymentMethodTotal.js';
import { updateInterviewCarouselUI } from '/js/utils/interview-carousel.js';


const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);
const cart = new Cart({ products, storefront });

cart.load();
renderCartSummary(cart);
bindCartEvents(cart);

document.addEventListener("DOMContentLoaded", () => {
  outputCartTotal(cart);
  outputCartTally(cart);
  tablePurchasedItems(cart);
  outputCartSavings(cart);
  outputSalesTax(cart, storefront);
  outputPaymentMethodTotal(cart);
  updateInterviewCarouselUI();

  window.dispatchEvent(new Event('show-backdrop'));
});


