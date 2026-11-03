import { cart } from '/assets/js/cart/cart-instance.js';
import { renderCartSummary, bindCartEvents } from '/assets/js/cart/cart-usage.js';
import { outputCartTotal, outputCartTally } from '/assets/js/utils/output-cartTotal.js';
import { tablePurchasedItems } from '/assets/js/utils/table-purchasedItems.js';
import { outputCartSavings, outputSalesTax } from '/assets/js/utils/output-cartPriceAdjustments.js';
import { outputPaymentMethodTotal } from '/assets/js/utils/output-paymentMethodTotal.js';


// const cart = new Cart({ products, storefront });

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
});


