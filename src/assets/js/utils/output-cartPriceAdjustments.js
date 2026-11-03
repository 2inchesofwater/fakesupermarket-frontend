export function outputCartSavings(cart) {
  const savingsTarget = document.getElementById('confirmationReceipt-savings-amount');
  if (!savingsTarget) return;

  let totalSavings = 0;

  for (const sku in cart.items) {
    const { quantity } = cart.items[sku];
    const product = cart.getProductBySku(sku);
    if (!product) continue;

    if (product.priceCurrent != null) {
      const priceCurrent = parseFloat(product.priceCurrent);
      const priceRrp = parseFloat(product.priceRrp);

      // Only calculate savings if both are valid numbers and RRP > priceCurrent
      if (!isNaN(priceCurrent) && !isNaN(priceRrp) && priceRrp > priceCurrent) {
        totalSavings += (priceRrp - priceCurrent) * quantity;
      }
    }
  }

  savingsTarget.textContent = cart.formatPrice(totalSavings);
}

export function outputSalesTax(cart, storefront) {
  const taxTarget = document.getElementById('confirmationReceipt-salesTax-amount');
  if (!taxTarget) return;

  const salesTaxPercentage = Number(storefront.salesTaxPercentage) || 0;
  let totalTax = 0;

  for (const sku in cart.items) {
    const { quantity } = cart.items[sku];
    const product = cart.getProductBySku(sku);
    if (!product) continue;

    // Use priceCurrent if not null, else priceRrp
    const unitPrice = product.priceCurrent != null ? Number(product.priceCurrent) : Number(product.priceRrp);
    if (isNaN(unitPrice)) continue;

    // Tax for this line
    const lineTax = unitPrice * salesTaxPercentage * quantity;
    totalTax += lineTax;
  }

  taxTarget.textContent = cart.formatPrice(totalTax);
}