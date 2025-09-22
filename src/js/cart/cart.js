/*
Cart Module - Refactored MVP

- Encapsulates cart state, storage, expiry, and CRUD operations.
- Extensible cart item schema.
- UI update hooks for integrating with summary views, checkout, etc.

Usage:
  import Cart from './cart.js';
  const cart = new Cart();
  cart.load();
  cart.addItem(sku, quantity);
  cart.save();
*/

const CART_STORAGE_KEY = 'cart';
const CART_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7; // 1 week

export class Cart {
  constructor(options = {}) {
    this.items = {}; // { sku: { quantity, acceptSubstitutions?, ... } }
    this.totalItems = 0;
    this.totalCost = 0;
    this.expiry = null;
    this.loadedFromStorage = false;
    this.products = options.products || window.products || [];
    this.storefront = options.storefront || window.storefront || {};
    // For UI hooks
    this.onUpdate = options.onUpdate || (() => {});
  }

  // --- Storage ---
  save() {
    this.expiry = Date.now() + CART_EXPIRY_MS;
    const data = {
      cart: {
        items: this.items,
        totalItems: this.totalItems,
        totalCost: this.totalCost
      },
      expiry: this.expiry
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    this.onUpdate(this);
  }

  load() {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const { cart: parsedCart, expiry } = JSON.parse(stored);
        if (expiry && Date.now() > expiry) {
          this.reset();
          this.loadedFromStorage = false;
          return;
        }
        this.items = parsedCart.items || {};
        this.totalItems = parsedCart.totalItems || 0;
        this.totalCost = parsedCart.totalCost || 0;
        this.expiry = expiry;
        this.loadedFromStorage = true;
      } catch (e) {
        this.reset();
        this.loadedFromStorage = false;
      }
    } else {
      this.reset();
      this.loadedFromStorage = false;
    }
    this.onUpdate(this);
  }

  reset() {
    this.items = {};
    this.totalItems = 0;
    this.totalCost = 0;
    this.expiry = null;
    localStorage.removeItem(CART_STORAGE_KEY);
    this.onUpdate(this);
  }

  // --- Cart Operations ---
  addItem(sku, quantity = 1, options = {}) {
    console.log('this.items[sku] before:', this.items[sku], typeof this.items[sku]);
console.log('options:', options, typeof options);
    if (!sku || quantity < 1) return;
    const product = this.getProductBySku(sku);
    if (!product) return;

    if (!this.items[sku]) {
      this.items[sku] = {
        quantity: 0,
        ...options
      };
    }
    this.items[sku].quantity += quantity;
    this.recalculate();
    this.save();
  }

  updateItemQuantity(sku, quantity) {
    if (!sku || quantity < 0) return;
    if (!this.items[sku]) return;
    if (quantity === 0) {
      delete this.items[sku];
    } else {
      this.items[sku].quantity = quantity;
    }
    this.recalculate();
    this.save();
  }

  removeItem(sku) {
    if (!sku || !this.items[sku]) return;
    delete this.items[sku];
    this.recalculate();
    this.save();
  }

  removeAll() {
    this.reset();
  }

  // --- Calculation ---
  recalculate() {
    let totalItems = 0;
    let totalCost = 0;
    for (const [sku, item] of Object.entries(this.items)) {
      const product = this.getProductBySku(sku);
      if (!product) continue;
      const price = parseFloat(product.priceCurrent ?? product.priceRrp);
      totalItems += item.quantity;
      totalCost += price * item.quantity;
    }
    this.totalItems = totalItems;
    this.totalCost = totalCost;
  }

  getTotalSavings() {
    let totalSavings = 0;
    for (const [sku, item] of Object.entries(this.items)) {
      const product = this.getProductBySku(sku);
      if (!product) continue;
      const rrp = parseFloat(product.priceRrp);
      const current = parseFloat(product.priceCurrent ?? product.priceRrp);
      if (rrp > current) {
        totalSavings += (rrp - current) * item.quantity;
      }
    }
    return totalSavings;
  }

  // --- Product Lookup ---
  getProductBySku(sku) {
    return this.products.find(p => p.productSku === sku);
  }

  // --- UI Helpers ---
  formatPrice(amount) {
    const currency = this.storefront.currencySymbol || '$';
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  }

  // Call this when you want to sync UI after cart changes
  setUpdateHandler(fn) {
    this.onUpdate = fn;
  }
}

export default Cart;