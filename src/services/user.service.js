import api from './api';

/**
 * User service for user-facing e-commerce website
 */
const UserService = {
  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getUserProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user profile
   */
  updateUserProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Password change confirmation
   */
  changePassword: async (passwordData) => {
    const response = await api.put('/user/password', passwordData);
    return response.data;
  },

  /**
   * Get user addresses
   * @returns {Promise<Object>} User addresses
   */
  getUserAddresses: async () => {
    const response = await api.get('/user/addresses');
    return response.data;
  },

  /**
   * Add a new address
   * @param {Object} addressData - Address data
   * @returns {Promise<Object>} Created address
   */
  addAddress: async (addressData) => {
    const response = await api.post('/user/addresses', addressData);
    return response.data;
  },

  /**
   * Update an address
   * @param {string} id - Address ID
   * @param {Object} addressData - Updated address data
   * @returns {Promise<Object>} Updated address
   */
  updateAddress: async (id, addressData) => {
    const response = await api.put(`/user/addresses/${id}`, addressData);
    return response.data;
  },

  /**
   * Delete an address
   * @param {string} id - Address ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteAddress: async (id) => {
    const response = await api.delete(`/user/addresses/${id}`);
    return response.data;
  },

  /**
   * Set default address
   * @param {string} id - Address ID
   * @param {string} type - Address type ('shipping' or 'billing')
   * @returns {Promise<Object>} Updated address
   */
  setDefaultAddress: async (id, type) => {
    const response = await api.put(`/user/addresses/${id}/default`, { type });
    return response.data;
  },

  /**
   * Get user wishlist
   * @returns {Promise<Object>} Wishlist items
   */
  getWishlist: async () => {
    const response = await api.get('/user/wishlist');
    return response.data;
  },

  /**
   * Add item to wishlist
   * @param {Object} wishlistData - Wishlist item data
   * @param {string} wishlistData.productId - Product ID
   * @returns {Promise<Object>} Updated wishlist
   */
  addToWishlist: async (wishlistData) => {
    const response = await api.post('/user/wishlist', wishlistData);
    return response.data;
  },

  /**
   * Remove item from wishlist
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Updated wishlist
   */
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/user/wishlist/${productId}`);
    return response.data;
  },

  /**
   * Get user notifications
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} Notifications with pagination
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/user/notifications', { params });
    return response.data;
  },

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  markNotificationAsRead: async (id) => {
    const response = await api.put(`/user/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Confirmation
   */
  markAllNotificationsAsRead: async () => {
    const response = await api.put('/user/notifications/read-all');
    return response.data;
  }
};

export default UserService;