import api from '../api';

/**
 * Customer service for admin customer operations
 */
const CustomerService = {
  /**
   * Get all customers with pagination, sorting, and filtering
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search term
   * @param {string} [params.status] - Status filter (active, inactive)
   * @returns {Promise<Object>} Customers data with pagination
   */
  getCustomers: async (params = {}) => {
    const response = await api.get('/admin/customers', { params });
    return response.data;
  },

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer data
   */
  createCustomer: async (customerData) => {
    try {
    const response = await api.post('/admin/customers', customerData);
    return response.data;
    } catch (error) {
      console.error(`Error creating customer: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to create customer');
    }
  },

  /**
   * Get a single customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  getCustomer: async (id) => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },

  /**
   * Update customer details
   * @param {string} id - Customer ID
   * @param {Object} customerData - Updated customer data
   * @returns {Promise<Object>} Updated customer data
   */
  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/admin/customers/${id}`, customerData);
    return response.data;
  },

  /**
   * Get customer orders
   * @param {string} id - Customer ID
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} Customer orders with pagination
   */
  getCustomerOrders: async (id, params = {}) => {
    const response = await api.get(`/admin/customers/${id}/orders`, { params });
    return response.data;
  },

  /**
   * Get customer reviews
   * @param {string} id - Customer ID
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} Customer reviews with pagination
   */
  getCustomerReviews: async (id, params = {}) => {
    const response = await api.get(`/admin/customers/${id}/reviews`, { params });
    return response.data;
  },

  /**
   * Add a note to a customer
   * @param {string} id - Customer ID
   * @param {Object} noteData - Note data
   * @param {string} noteData.content - Note content
   * @returns {Promise<Object>} Updated customer with notes
   */
  addCustomerNote: async (id, noteData) => {
    const response = await api.post(`/admin/customers/${id}/notes`, noteData);
    return response.data;
  },

  /**
   * Get customer notes
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Customer notes
   */
  getCustomerNotes: async (id) => {
    const response = await api.get(`/admin/customers/${id}/notes`);
    return response.data;
  },

  /**
   * Delete a customer note
   * @param {string} customerId - Customer ID
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteCustomerNote: async (customerId, noteId) => {
    const response = await api.delete(`/admin/customers/${customerId}/notes/${noteId}`);
    return response.data;
  },

  /**
   * Update customer VIP status
   * @param {string} id - Customer ID
   * @param {boolean} isVip - VIP status
   * @returns {Promise<Object>} Updated customer data
   */
  updateCustomerVip: async (id, isVip) => {
    const response = await api.put(`/admin/customers/${id}/vip`, { isVip });
    return response.data;
  },

  /**
   * Flag customer for review
   * @param {string} id - Customer ID
   * @param {boolean} isFlagged - Flag status
   * @returns {Promise<Object>} Updated customer data
   */
  updateCustomerFlag: async (id, isFlagged) => {
    const response = await api.put(`/admin/customers/${id}/flag`, { isFlagged });
    return response.data;
  },

  /**
   * Deactivate customer
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Updated customer data
   */
  deactivateCustomer: async (id) => {
    const response = await api.put(`/admin/customers/${id}/deactivate`);
    return response.data;
  },
};

export default CustomerService;