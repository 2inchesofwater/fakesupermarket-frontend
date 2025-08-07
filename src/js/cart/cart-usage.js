

const cartSummary = document.getElementById('cart-summary');
const cartSummaryProducts = document.getElementById('cart-summary-products');
const cartSummaryProductsList = document.getElementById('cart-summary-products-list');
const cartSummaryProductsEmptyMsg = document.getElementById('cart-summary-products-empty');
const cartSummarySubtotalAmount = document.getElementById('cart-summary-subtotal-amount');

// import { activateCheckoutBtn } from '/js/pages/cart-overlay.js';
import { createModalCartItem } from '/js/cart/cartItemTemplates.js';


export function renderCartSummary(cartInstance) {
  renderCartSummaryList(cartInstance);
  updateCartSubtotal(cartInstance, { el: cartSummarySubtotalAmount });
}

export function getProductBySku(sku) {
  return products.find(p => p.productSku === sku);
}



export function renderCartSummaryList(cartInstance) {  
  if (!cartSummaryProductsList) return;

  cartSummaryProductsList.innerHTML = '';
  for (const sku of Object.keys(cartInstance.items)) {
    const li = createModalCartItem(cartInstance, sku);
    if (li) {
      cartSummaryProductsList.appendChild(li);
    }
  }

  
  if (Object.keys(cartInstance.items).length === 0) {
    cartSummary.classList.add('empty');
    cartSummaryProducts.hidden = true;
    cartSummaryProductsEmptyMsg.hidden = false;
  } else {
    cartSummary.classList.remove('empty');
    cartSummaryProducts.hidden = false;
    cartSummaryProductsEmptyMsg.hidden = true;
  }
}

function updateCartSubtotal(cartInstance, { el = null } = {}) {
  if (!el) return;

  const currency = storefront.currencySymbol || '$';
  const subtotal = parseFloat(cartInstance.totalCost || 0).toFixed(2);

  el.textContent = cartInstance.formatPrice(cartInstance.totalCost);
}

export function bindCartEvents(cartInstance, { addItemToCart = '.btn.add-to-cart' } = {}) {
  document.addEventListener('click', function (e) {
    if (e.target.closest(addItemToCart)) {
      const sku = e.target.dataset.sku;
      cartInstance.addItem(sku, 1);
    }

    let cartChanged = false;
    if (e.target.closest('.control-plus')) {
      // console.log('added');
      const sku = e.target.closest('.cart-item-product')?.id?.replace('cart-item-product-', '');
      if (sku) {
        cartInstance.addItem(sku, 1);
        cartChanged = true;
      }
    }
    if (e.target.closest('.control-minus')) {
      const sku = e.target.closest('.cart-item-product')?.id?.replace('cart-item-product-', '');
      if (sku && cartInstance.items[sku]) {
        cartInstance.updateItemQuantity(sku, cartInstance.items[sku].quantity - 1);
        cartChanged = true;
      }
    }
    if (e.target.closest('.control-remove')) { 
      // console.log('remove');
      const sku = e.target.closest('.cart-item-product')?.id?.replace('cart-item-product-', '');
      if (sku) {
        cartInstance.removeItem(sku);
        cartChanged = true;
      }
    }
    if (e.target.closest('.btn-remove-all')) { // Remove all items (confirmation dialog)
      if (window.confirm('Remove all items from cart?')) {
        cartInstance.removeAll();
        cartChanged = true;
      }
    }
    if (cartChanged) {
      //renderCartSummary(cartInstance);
      const evt = new CustomEvent('cartChanged', { detail: { cartInstance } });
      document.dispatchEvent(evt);
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.matches('input[type="number"][name^="control-product-quantity-input-"]')) {
      const sku = e.target.name.replace('control-product-quantity-input-', '');
      const val = parseInt(e.target.value, 10);
      if (sku && !isNaN(val)) {
        cartInstance.updateItemQuantity(sku, val);
        renderCartSummary(cartInstance);
      }
    }
  });
}
