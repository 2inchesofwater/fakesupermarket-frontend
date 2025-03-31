// Handle cart functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart
  let cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
  updateCartCount();
  
  // Add event listeners for add to cart buttons
  document.addEventListener('click', function(event) {
    if (event.target.matches('[data-action="add-to-cart"]') || 
        event.target.closest('[data-action="add-to-cart"]')) {
      
      const button = event.target.matches('[data-action="add-to-cart"]') ? 
                      event.target : 
                      event.target.closest('[data-action="add-to-cart"]');
      
      const productId = button.dataset.productId;
      addToCart(productId);
      
      event.preventDefault();
    }
  });
  
  function addToCart(productId) {
    // In a real app, you would fetch the product details from an API
    // For now, we'll just show an alert
    alert(`Product ${productId} added to cart!`);
    
    // Update cart count (this would be replaced with actual logic)
    cart.items.push({ id: productId, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }
  
  function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = cart.items.length;
    }
  }
});