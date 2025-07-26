import api from './api';

/**
 * @desc    Handles API requests, data extraction, and error parsing.
 * @param   {Promise} request - The API request promise (e.g., api.get('/cart')).
 * @returns {Promise<Object>} The cart data from the response.
 * @throws  {Error} A formatted error with a message from the backend.
 */
const handleRequest = async (request) => {
  try {
    const response = await request;
    // Standardized response from our backend success utility
    return response.data.data.cart;
  } catch (error) {
    // Extract the specific error message from our backend ErrorResponse middleware
    const message = error.response?.data?.error || 'An unexpected error occurred.';
    console.error('Cart Service Error:', message, error.response);
    throw new Error(message);
  }
};

/**
 * Cart service for user-facing e-commerce website
 */
const CartService = {
  /**
   * Get cart items
   */
  getCart: () => handleRequest(api.get('/cart')),

  /**
   * Add item to cart
   * @param {{productId: string, quantity: number, variantId?: string}} cartItem
   */
  addToCart: (cartItem) => handleRequest(api.post('/cart', cartItem)),

  /**
   * Update cart item quantity
   * @param {string} itemId
   * @param {{quantity: number}} updateData
   */
  updateCartItem: (itemId, updateData) => handleRequest(api.put(`/cart/${itemId}`, updateData)),

  /**
   * Remove item from cart
   * @param {string} itemId
   */
  removeFromCart: (itemId) => handleRequest(api.delete(`/cart/${itemId}`)),

  /**
   * Clear cart
   */
  clearCart: () => handleRequest(api.delete('/cart')),

  /**
   * Apply coupon to cart
   * @param {{code: string}} couponData
   */
  applyCoupon: (couponData) => handleRequest(api.post('/cart/coupon', couponData)),

  /**
   * Remove coupon from cart
   */
  removeCoupon: () => handleRequest(api.delete('/cart/coupon')),
};

export default CartService;