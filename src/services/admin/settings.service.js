import api from '../api';

/**
 * ==================================================
 * STORE SETTINGS FUNCTIONS
 * ==================================================
 */
/**
 * Get the entire settings object
 * @returns {Promise<Object>} The settings object
 */
const getStoreSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    // Our backend nests the data, so we return the core settings object
    return response.data.data.settings;
  } catch (error) {
    console.error('Error in getStoreSettings:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || new Error('Failed to fetch settings');
  }
};

/**
 * Update general store settings
 * @param {Object} settingsData - The fields to update (e.g., { storeName: 'New Name' })
 * @returns {Promise<Object>} The updated settings object
 */
const updateStoreSettings = async (settingsData) => {
  try {
    const response = await api.put('/admin/settings', settingsData);
    return response.data.data.settings;
  } catch (error) {
    console.error('Error in updateStoreSettings:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || new Error('Failed to update settings');
  }
};


/**
 * ==================================================
 * SHIPPING ZONE FUNCTIONS
 * ==================================================
 */

/**
 * Add a new shipping zone
 * @param {Object} zoneData - { name: string, regions: string[], active: boolean }
 * @returns {Promise<Object>} The newly created shipping zone
 */
const addShippingZone = async (zoneData) => {
  try {
    const response = await api.post('/admin/settings/shipping-zones', zoneData);
    return response.data.data.shippingZone;
  } catch (error) {
    console.error('Error adding shipping zone:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || new Error('Failed to add shipping zone');
  }
};

/**
 * Update an existing shipping zone
 * @param {string} zoneId - The ID of the zone to update
 * @param {Object} zoneData - The fields to update { name, regions, active }
 * @returns {Promise<Object>} The updated shipping zone
 */
const updateShippingZone = async (zoneId, zoneData) => {
  try {
    const response = await api.put(`/admin/settings/shipping-zones/${zoneId}`, zoneData);
    return response.data.data.shippingZone;
  } catch (error) {
    console.error('Error updating shipping zone:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || new Error('Failed to update shipping zone');
  }
};

/**
 * Delete a shipping zone
 * @param {string} zoneId - The ID of the zone to delete
 * @returns {Promise<Object>} The success response
 */
const deleteShippingZone = async (zoneId) => {
  try {
    const response = await api.delete(`/admin/settings/shipping-zones/${zoneId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting shipping zone:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || new Error('Failed to delete shipping zone');
  }
};


/**
 * ==================================================
 * SHIPPING RATE FUNCTIONS (within a zone)
 * ==================================================
 */

/**
 * Add a shipping rate to a specific zone
 * @param {string} zoneId - The ID of the parent zone
 * @param {Object} rateData - { name, price, description, freeShippingThreshold, active }
 * @returns {Promise<Object>} The newly created shipping rate
 */
const addRateToZone = async (zoneId, rateData) => {
  try {
    const response = await api.post(`/admin/settings/shipping-zones/${zoneId}/rates`, rateData);
    return response.data.data.rate;
  } catch (error) {
    console.error('Error adding shipping rate:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || new Error('Failed to add shipping rate');
  }
};

/**
 * Update a shipping rate within a zone
 * @param {string} zoneId - The ID of the parent zone
 * @param {string} rateId - The ID of the rate to update
 * @param {Object} rateData - The fields to update
 * @returns {Promise<Object>} The updated shipping rate
 */
const updateRateInZone = async (zoneId, rateId, rateData) => {
  try {
    const response = await api.put(`/admin/settings/shipping-zones/${zoneId}/rates/${rateId}`, rateData);
    return response.data.data.rate;
  } catch (error) {
    console.error('Error updating shipping rate:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || new Error('Failed to update shipping rate');
  }
};

/**
 * Delete a shipping rate from a zone
 * @param {string} zoneId - The ID of the parent zone
 * @param {string} rateId - The ID of the rate to delete
 * @returns {Promise<Object>} The success response
 */
const deleteRateFromZone = async (zoneId, rateId) => {
  try {
    const response = await api.delete(`/admin/settings/shipping-zones/${zoneId}/rates/${rateId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting shipping rate:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || new Error('Failed to delete shipping rate');
  }
};


/**
 * ==================================================
 * PAYMENT METHOD FUNCTIONS 
 * ==================================================
 */


/**
 * Add a new payment method
 * @param {Object} methodData - { name, displayName, description, active, config }
 * @returns {Promise<Object>} The newly created payment method
 */
const addPaymentMethod = async (methodData) => {
    try {
        const response = await api.post('/admin/settings/payment-methods', methodData);
        return response.data.data.paymentMethod;
    } catch (error) {
        console.error('Error adding payment method:', error.response?.data?.error || error.message);
        throw error.response?.data?.error || new Error('Failed to add payment method');
    }
};

/**
 * Update a payment method
 * @param {string} methodId - The ID of the payment method to update
 * @param {Object} methodData - The fields to update
 * @returns {Promise<Object>} The updated payment method
 */
const updatePaymentMethod = async (methodId, methodData) => {
    try {
        const response = await api.put(`/admin/settings/payment-methods/${methodId}`, methodData);
        return response.data.data.paymentMethod;
    } catch (error) {
        console.error('Error updating payment method:', error.response?.data?.error || error.message);
        throw error.response?.data?.error || new Error('Failed to update payment method');
    }
};

/**
 * Delete a payment method
 * @param {string} methodId - The ID of the payment method to delete
 * @returns {Promise<Object>} The success response
 */
const deletePaymentMethod = async (methodId) => {
    try {
        const response = await api.delete(`/admin/settings/payment-methods/${methodId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting payment method:', error.response?.data?.error || error.message);
        throw error.response?.data?.error || new Error('Failed to delete payment method');
    }
};


/**
 * ==================================================
 * ADMIN USERS FUNCTIONS MANAGEMNET
 * ==================================================
 */


  /**
   * Get all admin users
   * @returns {Promise<Object>} Admin users
   */
  const getAdminUsers= async () => {
    try {
      const response = await api.get('/admin/users');
      console.log('getAdminUsers response:', response.data);
      return response.data.data; // Returns { users, pagination metadata }
    } catch (error) {
      console.error('Error in getAdminUsers:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  /**
   * Get a single admin user
   * @param {string} id - Admin user ID
   * @returns {Promise<Object>} Admin user data
   */
  const getAdminUser= async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      console.log('getAdminUser response:', response.data);
      return response.data.data; // Returns { user }
    } catch (error) {
      console.error('Error in getAdminUser:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  /**
   * Create a new admin user
   * @param {Object} userData - Admin user data
   * @returns {Promise<Object>} Created admin user
   */
  const createAdminUser = async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      console.log('createAdminUser response:', response.data);
      return response.data.data; // Returns { user }
    } catch (error) {
      console.error('Error in createAdminUser:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  /**
   * Update an admin user
   * @param {string} id - Admin user ID
   * @param {Object} userData - Updated admin user data
   * @returns {Promise<Object>} Updated admin user
   */
  const updateAdminUser = async (id, userData) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      console.log('updateAdminUser response:', response.data);
      return response.data.data; // Returns { user }
    } catch (error) {
      console.error('Error in updateAdminUser:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  /**
   * Delete an admin user
   * @param {string} id - Admin user ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  const deleteAdminUser= async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      console.log('deleteAdminUser response:', response.data);
      return response.data; // Returns success message
    } catch (error) {
      console.error('Error in deleteAdminUser:', error.response?.data?.error || error.message);
      throw error;
    }
  }


  // We export everything under a single, organized service object.
const SettingsService = {
  getStoreSettings,
  updateStoreSettings,
  addShippingZone,
  updateShippingZone,
  deleteShippingZone,
  addRateToZone,
  updateRateInZone,
  deleteRateFromZone,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  createAdminUser,
  deleteAdminUser,
  getAdminUser,
  getAdminUsers,
};


export default SettingsService;