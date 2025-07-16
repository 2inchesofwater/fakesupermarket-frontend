// js/cart/utils.js

export function getProductBySku(sku) {
  return products.find(p => p.productSku === sku);
}

export function updateCartSubtotal(cart, targetElementId) {
  const subtotalElement = document.getElementById(targetElementId);
  if (!subtotalElement) return;

  const currency = storefront.currencySymbol || '$';
  const subtotal = parseFloat(cart.totalCost || 0).toFixed(2);

  subtotalElement.textContent = `${currency}${subtotal}`;
}
