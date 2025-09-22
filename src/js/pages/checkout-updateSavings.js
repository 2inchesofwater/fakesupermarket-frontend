export function updateTotalSavings(cartInstance) {
  let totalSavings = 0;
  for (const [sku, item] of Object.entries(cartInstance.items)) {
    const product = cartInstance.getProductBySku(sku);
    if (!product) continue;
    const rrp = parseFloat(product.priceRrp);
    const current = parseFloat(product.priceCurrent ?? product.priceRrp);
    if (rrp > current) {
      totalSavings += (rrp - current) * item.quantity;
    }
  }
  const savingsTable = document.getElementById('paymentFlow-totalSavings');
  const savingsAmount = document.getElementById('paymentFlow-totalSavings-calculation');
  if (totalSavings > 0) {
    savingsTable?.removeAttribute('hidden');
    if (savingsAmount) {
      savingsAmount.textContent = cartInstance.formatPrice(totalSavings);
    }
  } else {
    savingsTable?.setAttribute('hidden', 'true');
  }
}

