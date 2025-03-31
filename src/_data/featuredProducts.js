// src/_data/featuredProducts.js
const { fetchFromApi } = require('./_kirbyApi');

module.exports = async function() {
  try {
    return await fetchFromApi('products/featured');
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};