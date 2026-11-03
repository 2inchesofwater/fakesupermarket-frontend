import { Cart } from './cart.js'; 

const products = JSON.parse(document.getElementById('products').textContent);
const storefront = JSON.parse(document.getElementById('storefront').textContent);

// Create and export a single Cart instance
export const cart = new Cart({ products, storefront });