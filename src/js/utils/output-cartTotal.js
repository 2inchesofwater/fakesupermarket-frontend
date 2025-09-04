export function outputCartTotal(cart) {
  const totalTarget = document.getElementById('confirmationReceipt-total-amount');
  if (!totalTarget) return;

  let total = 0;

  for (const sku in cart.items) {
    const { quantity } = cart.items[sku];
    const product = cart.getProductBySku(sku);
    if (!product) continue;

    const isDiscounted = product.priceCurrent != null;
    const unitPrice = isDiscounted ? product.priceCurrent : product.priceRrp;

    total += Number(unitPrice) * quantity;
  }

  totalTarget.textContent = cart.formatPrice(total);
}

export function outputCartTally(cart) {
  const tallyTarget = document.getElementById('confirmationReceipt-total-tally');
  if (!tallyTarget) return;

  let itemCount = 0;
  for (const sku in cart.items) {
    itemCount += Number(cart.items[sku].quantity) || 0;
  }

  tallyTarget.textContent = `(${itemCount} item${itemCount === 1 ? '' : 's'})`;
}
