import { getProductBySku } from './utils.js';

export function renderCartItems(cart, container, itemRenderer) {
  container.innerHTML = '';

  for (const [sku, quantity] of Object.entries(cart.items)) {
    const product = getProductBySku(sku);
    if (!product) continue;

    const item = itemRenderer(product, quantity);
    container.appendChild(item);
  }
}
