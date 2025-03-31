// src/_data/products.js
const { fetchFromApi } = require('./_kirbyApi');

module.exports = async function() {
  try {
    return await fetchFromApi('products/all');
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};