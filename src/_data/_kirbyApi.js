// src/_data/_kirbyApi.js
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const KIRBY_API_URL = process.env.KIRBY_API_URL || 'http://localhost:8000/api';
const KIRBY_API_USERNAME = process.env.KIRBY_API_USERNAME;
const KIRBY_API_PASSWORD = process.env.KIRBY_API_PASSWORD;

let apiCache = {};

async function fetchFromApi(endpoint, useCache = true) {
  // Check cache first if enabled
  if (useCache && apiCache[endpoint]) {
    return apiCache[endpoint];
  }
  
  let options = {};
  
  // Add authentication if credentials are provided
  if (KIRBY_API_USERNAME && KIRBY_API_PASSWORD) {
    const auth = Buffer.from(`${KIRBY_API_USERNAME}:${KIRBY_API_PASSWORD}`).toString('base64');
    options.headers = {
      'Authorization': `Basic ${auth}`
    };
  }

  try {
    const response = await fetch(`${KIRBY_API_URL}/${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Save to cache if enabled
    if (useCache) {
      apiCache[endpoint] = data;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching from API (${endpoint}):`, error);
    throw error;
  }
}

module.exports = {
  fetchFromApi,
  clearCache: () => { apiCache = {}; }
};