import { cart } from '/assets/js/cart/cart-instance.js';

import { updateInterviewCarouselUI } from '/assets/js/utils/interview-carousel.js';
import { createResearchCartItem } from '/assets/js/cart/cartItemTemplates.js';

cart.load();

export function selectInterviewProducts(cart) {
	
  const interviewLists = document.querySelectorAll('.fs-interview-product');
  const cartSkus = Object.keys(cart.items);

  interviewLists.forEach(list => {
    if (cartSkus.length === 0) return;
    const randomSku = cartSkus[Math.floor(Math.random() * cartSkus.length)];
    const researchCartItem = createResearchCartItem(cart, randomSku);
	console.log("Select interview products");

    list.innerHTML = '';
    if (researchCartItem) {
      list.appendChild(researchCartItem);
    }
  });
}


document.addEventListener("DOMContentLoaded", () => {
  updateInterviewCarouselUI();
  selectInterviewProducts(cart);
  window.dispatchEvent(new Event('show-backdrop-slow'));
});