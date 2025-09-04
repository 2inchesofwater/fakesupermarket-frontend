export function tablePurchasedItems(cart) {
  const dl = document.getElementById('confirmationReceipt-products-table');
  if (!dl) return;

  // Remove all product rows, keep header pair (assumes first <dd> and <dt> are header)
  // We'll find the header elements and remove all siblings after them
  const children = Array.from(dl.children);
  const headerDd = children.find(el => el.tagName === 'DD');
  const headerDt = children.find(el => el.tagName === 'DT');
  let firstProductNode = null;

  if (headerDd && headerDt) {
    // Find the node after the header <dt>
    const headerIndex = children.indexOf(headerDt);
    firstProductNode = children[headerIndex + 1];
    // Remove all nodes after header <dt>
    while (firstProductNode) {
      const next = firstProductNode.nextElementSibling;
      dl.removeChild(firstProductNode);
      firstProductNode = next;
    }
  }

  // Now append product rows
  for (const sku in cart.items) {
    const { quantity } = cart.items[sku];
    const product = cart.getProductBySku(sku);
    if (!product) continue;

    // 1. Description logic
    // Promo asterisk
    const isPromo = product.priceCurrent != null;
    const asterisk = isPromo ? "<span class='indicator' aria-label='This product has a discounted price'>*</span>" : '';
    // Product name
    const productName = product.productName || '';
    // Gross weight (if not null/empty)
    const grossWeight = (product.productGrossWeight && product.productGrossWeight.trim()) 
      ? ` ${product.productGrossWeight.trim()}` 
      : '';
    // Quantity display if > 1
    const quantitySuffix = quantity > 1 ? ` @ ${quantity}ea` : '';

    const description = `${asterisk}${productName}${grossWeight}${quantitySuffix}`;

    // 2. Price logic (priceCurrent × quantity, formatted)
    const unitPrice = (
      typeof product.priceCurrent === 'string' && !isNaN(product.priceCurrent) && product.priceCurrent > 0
    )
  ? product.priceCurrent
  : product.priceRrp;
    const lineTotal = Number(unitPrice || 0) * quantity;
    const priceDisplay = cart.formatPrice(lineTotal);

    // 3. Create and append elements
    const dd = document.createElement('dd');
    dd.className = 'product';
    dd.innerHTML = description;

    const dt = document.createElement('dt');
    dt.className = 'product numeric';
    dt.textContent = priceDisplay;

    dl.appendChild(dd);
    dl.appendChild(dt);
  }
}