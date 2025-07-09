import api from './api';

/**
 * Cart service for user-facing e-commerce website
 */
const CartService = {
  /**
   * Get cart items
   * @returns {Promise<Object>} Cart data
   */
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  /**
   * Add item to cart
   * @param {Object} cartItem - Cart item data
   * @param {string} cartItem.productId - Product ID
   * @param {number} cartItem.quantity - Quantity
   * @param {string} [cartItem.variantId] - Variant ID (if applicable)
   * @returns {Promise<Object>} Updated cart
   */
  addToCart: async (cartItem) => {
    const response = await api.post('/cart/items', cartItem);
    return response.data;
  },

  /**
   * Update cart item quantity
   * @param {string} itemId - Cart item ID
   * @param {Object} updateData - Update data
   * @param {number} updateData.quantity - New quantity
   * @returns {Promise<Object>} Updated cart
   */
  updateCartItem: async (itemId, updateData) => {
    const response = await api.put(`/cart/items/${itemId}`, updateData);
    return response.data;
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Cart item ID
   * @returns {Promise<Object>} Updated cart
   */
  removeFromCart: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  /**
   * Clear cart
   * @returns {Promise<Object>} Empty cart
   */
  clearCart: async () => {
    const response = await api.delete('/cart/items');
    return response.data;
  },

  /**
   * Apply coupon to cart
   * @param {Object} couponData - Coupon data
   * @param {string} couponData.code - Coupon code
   * @returns {Promise<Object>} Updated cart with applied coupon
   */
  applyCoupon: async (couponData) => {
    const response = await api.post('/cart/coupon', couponData);
    return response.data;
  },

  /**
   * Remove coupon from cart
   * @returns {Promise<Object>} Updated cart without coupon
   */
  removeCoupon: async () => {
    const response = await api.delete('/cart/coupon');
    return response.data;
  },

  /**
   * Get cart summary (totals, discounts, etc.)
   * @returns {Promise<Object>} Cart summary
   */
  getCartSummary: async () => {
    const response = await api.get('/cart/summary');
    return response.data;
  },

  /**
   * Get shipping methods available for the current cart
   * @returns {Promise<Object>} Available shipping methods
   */
  getShippingMethods: async () => {
    const response = await api.get('/cart/shipping-methods');
    return response.data;
  },

  /**
   * Set shipping method for the cart
   * @param {Object} shippingData - Shipping data
   * @param {string} shippingData.methodId - Shipping method ID
   * @returns {Promise<Object>} Updated cart with shipping method
   */
  setShippingMethod: async (shippingData) => {
    const response = await api.post('/cart/shipping-method', shippingData);
    return response.data;
  }
};

export default CartService;