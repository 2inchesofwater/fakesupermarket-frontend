
let cart = loadCartFromStorage();
updateCartButton();

function addToCart(button) {
  if (!button || !button.dataset) {
    console.warn('addToCart called without a valid button element.');
    return;
  }

  const sku = button.dataset.sku;
  const price = parseFloat(button.dataset.price);

  if (!sku || isNaN(price)) {
    console.warn('Missing or invalid SKU/price');
    return;
  }

  // Update cart state
  cart.items[sku] = (cart.items[sku] || 0) + 1;
  cart.totalItems += 1;
  cart.totalCost += price;

  // Update button and save to localStorage
  updateCartButton(cart);
  saveCartToStorage();

  // If modal is visible, update the cart view
  const modal = document.getElementById('cart-modal');
  const isModalOpen = modal && (modal.offsetParent !== null || modal.classList.contains('is-open'));

  console.table(cart);
}


function updateCartButton() {
  const badge = document.querySelector('.badge.badge-tally');
  const tally = document.getElementById('cart-tally');
  const totalEl = document.getElementById('cart-total');
  
  if (!badge) return;

  if (tally) tally.textContent = cart.totalItems;
  if (totalEl) totalEl.textContent = cart.totalCost.toFixed(2);

  if (cart.totalItems > 0) {
    badge.hidden = false; 
    badge.textContent = cart.totalItems;

  } else {
    badge.textContent = '';
    badge.hidden = true;
  }
}

function saveCartToStorage() {
  const data = {
    cart,
    expiry: Date.now() + 1000 * 60 * 60 * 24 // 24 hours
  };
  localStorage.setItem('cart', JSON.stringify(data));
}

function loadCartFromStorage() {
  const stored = localStorage.getItem('cart');  
  if (stored) {
    try {
      const { cart: parsedCart, expiry } = JSON.parse(stored);
      if (expiry && Date.now() > expiry) {
        console.warn("Cart data expired, resetting.");
        throw new Error("Expired");
      }

      const cart = {
        totalItems: parsedCart.totalItems ?? 0,
        totalCost: parsedCart.totalCost ?? 0,
        items: parsedCart.items ?? {}
      };
      cart.loadedFromStorage = true;
      return cart;
    } catch (e) {
      console.warn("Corrupted cart data, resetting.");
    }
  }

  const cart = {
    totalItems: 0,
    totalCost: 0,
    items: {}
  };
  cart.loadedFromStorage = false;
  return cart;
}

function updateCartSummary(cart) {

  if (!cart || cart.totalItems == null) {
    console.warn('Cart data missing or invalid:', cart);
    return;
  }


  const cartItems = document.getElementById('cart-modal-items');
  const emptyMessage = document.getElementById('cart-message-empty');

  const hasItems = Number(cart.totalItems) >= 1;
  // console.log(hasItems);

  if (hasItems) {
    cartItems.removeAttribute('hidden');
    emptyMessage.setAttribute('hidden', '');
  } else {
    emptyMessage.removeAttribute('hidden');
    cartItems.setAttribute('hidden', '');
  }
}

window.updateCartSummary = updateCartSummary;