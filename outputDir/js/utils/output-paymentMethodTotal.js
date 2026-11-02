export function outputPaymentMethodTotal(cart) {
  const totalTarget = document.getElementById('confirmationReceipt-paymentMethod-total');
  if (!totalTarget) return;

  let total = 0;

  for (const sku in cart.items) {
    const { quantity } = cart.items[sku];
    const product = cart.getProductBySku(sku);
    if (!product) continue;

    const unitPrice = product.priceCurrent != null ? product.priceCurrent : product.priceRrp;
    total += Number(unitPrice) * quantity;
  }

  totalTarget.textContent = cart.formatPrice(total);
}