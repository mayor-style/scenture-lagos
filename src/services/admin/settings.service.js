import api from '../api';

/**
 * Settings service for admin settings operations
 */
const SettingsService = {
  /**
   * Get store settings
   * @returns {Promise<Object>} Store settings
   */
  getStoreSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  /**
   * Update store settings
   * @param {Object} settingsData - Updated settings data
   * @returns {Promise<Object>} Updated store settings
   */
  updateStoreSettings: async (settingsData) => {
    const response = await api.put('/admin/settings', settingsData);
    return response.data;
  },

  /**
   * Get all admin users
   * @returns {Promise<Object>} Admin users
   */
  getAdminUsers: async () => {
    const response = await api.get('/admin/settings/users');
    return response.data;
  },

  /**
   * Get a single admin user
   * @param {string} id - Admin user ID
   * @returns {Promise<Object>} Admin user data
   */
  getAdminUser: async (id) => {
    const response = await api.get(`/admin/settings/users/${id}`);
    return response.data;
  },

  /**
   * Create a new admin user
   * @param {Object} userData - Admin user data
   * @returns {Promise<Object>} Created admin user
   */
  createAdminUser: async (userData) => {
    const response = await api.post('/admin/settings/users', userData);
    return response.data;
  },

  /**
   * Update an admin user
   * @param {string} id - Admin user ID
   * @param {Object} userData - Updated admin user data
   * @returns {Promise<Object>} Updated admin user
   */
  updateAdminUser: async (id, userData) => {
    const response = await api.put(`/admin/settings/users/${id}`, userData);
    return response.data;
  },

  /**
   * Delete an admin user
   * @param {string} id - Admin user ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteAdminUser: async (id) => {
    const response = await api.delete(`/admin/settings/users/${id}`);
    return response.data;
  },

  /**
   * Get payment settings
   * @returns {Promise<Object>} Payment settings
   */
  getPaymentSettings: async () => {
    const response = await api.get('/admin/settings/payment');
    return response.data;
  },

  /**
   * Update payment settings
   * @param {Object} paymentData - Updated payment settings
   * @returns {Promise<Object>} Updated payment settings
   */
  updatePaymentSettings: async (paymentData) => {
    const response = await api.put('/admin/settings/payment', paymentData);
    return response.data;
  },

  /**
   * Get shipping settings
   * @returns {Promise<Object>} Shipping settings
   */
  getShippingSettings: async () => {
    const response = await api.get('/admin/settings/shipping');
    return response.data;
  },

  /**
   * Update shipping settings
   * @param {Object} shippingData - Updated shipping settings
   * @returns {Promise<Object>} Updated shipping settings
   */
  updateShippingSettings: async (shippingData) => {
    const response = await api.put('/admin/settings/shipping', shippingData);
    return response.data;
  },

  /**
   * Get email settings
   * @returns {Promise<Object>} Email settings
   */
  getEmailSettings: async () => {
    const response = await api.get('/admin/settings/email');
    return response.data;
  },

  /**
   * Update email settings
   * @param {Object} emailData - Updated email settings
   * @returns {Promise<Object>} Updated email settings
   */
  updateEmailSettings: async (emailData) => {
    const response = await api.put('/admin/settings/email', emailData);
    return response.data;
  }
};

export default SettingsService;