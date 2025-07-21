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
    try {
      const response = await api.get('/cart');
      console.log('getting', response.data.data)
      return response.data.data.cart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
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
    try {
      const response = await api.post('/cart', cartItem);
      return response.data.data.cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  /**
   * Update cart item quantity
   * @param {string} itemId - Cart item ID
   * @param {Object} updateData - Update data
   * @param {number} updateData.quantity - New quantity
   * @returns {Promise<Object>} Updated cart
   */
  updateCartItem: async (itemId, updateData) => {
    try {
      const response = await api.put(`/cart/${itemId}`, updateData);
      return response.data.data.cart;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Cart item ID
   * @returns {Promise<Object>} Updated cart
   */
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/${itemId}`);
      return response.data.data.cart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  /**
   * Clear cart
   * @returns {Promise<Object>} Empty cart
   */
  clearCart: async () => {
    try {
      const response = await api.delete('/cart');
      return response.data.data.cart;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  /**
   * Apply coupon to cart
   * @param {Object} couponData - Coupon data
   * @param {string} couponData.code - Coupon code
   * @returns {Promise<Object>} Updated cart with applied coupon
   */
  applyCoupon: async (couponData) => {
    try {
      const response = await api.post('/cart/coupon', couponData);
      return response.data.data.cart;
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  },

  /**
   * Remove coupon from cart
   * @returns {Promise<Object>} Updated cart without coupon
   */
  removeCoupon: async () => {
    try {
      const response = await api.delete('/cart/coupon');
      return response.data.data.cart;
    } catch (error) {
      console.error('Error removing coupon:', error);
      throw error;
    }
  },
};

export default CartService;