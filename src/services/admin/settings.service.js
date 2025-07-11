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
    try {
      const response = await api.get('/admin/settings');
      console.log('getStoreSettings response:', response.data);
      return response.data.data.settings;
    } catch (error) {
      console.error('Error in getStoreSettings:', error.response?.data?.error || error.message);
      throw error;
    }
  },

  /**
   * Update store settings
   * @param {Object} settingsData - Updated settings data
   * @returns {Promise<Object>} Updated store settings
   */
  updateStoreSettings: async (settingsData) => {
    try {
      const response = await api.put('/admin/settings', settingsData);
      console.log('updateStoreSettings response:', response.data);
      return response.data.data.settings;
    } catch (error) {
      console.error('Error in updateStoreSettings:', error.response?.data?.error || error.message);
      throw error;
    }
  },

  /**
   * Get all admin users
   * @returns {Promise<Object>} Admin users
   */
  getAdminUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      console.log('getAdminUsers response:', response.data);
      return response.data.data; // Returns { users, pagination metadata }
    } catch (error) {
      console.error('Error in getAdminUsers:', error.response?.data?.error || error.message);
      throw error;
    }
  },

  /**
   * Get a single admin user
   * @param {string} id - Admin user ID
   * @returns {Promise<Object>} Admin user data
   */
  getAdminUser: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      console.log('getAdminUser response:', response.data);
      return response.data.data; // Returns { user }
    } catch (error) {
      console.error('Error in getAdminUser:', error.response?.data?.error || error.message);
      throw error;
    }
  },

  /**
   * Create a new admin user
   * @param {Object} userData - Admin user data
   * @returns {Promise<Object>} Created admin user
   */
  createAdminUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      console.log('createAdminUser response:', response.data);
      return response.data.data; // Returns { user }
    } catch (error) {
      console.error('Error in createAdminUser:', error.response?.data?.error || error.message);
      throw error;
    }
  },

  /**
   * Update an admin user
   * @param {string} id - Admin user ID
   * @param {Object} userData - Updated admin user data
   * @returns {Promise<Object>} Updated admin user
   */
  updateAdminUser: async (id, userData) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      console.log('updateAdminUser response:', response.data);
      return response.data.data; // Returns { user }
    } catch (error) {
      console.error('Error in updateAdminUser:', error.response?.data?.error || error.message);
      throw error;
    }
  },

  /**
   * Delete an admin user
   * @param {string} id - Admin user ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteAdminUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      console.log('deleteAdminUser response:', response.data);
      return response.data; // Returns success message
    } catch (error) {
      console.error('Error in deleteAdminUser:', error.response?.data?.error || error.message);
      throw error;
    }
  },
};

export default SettingsService;