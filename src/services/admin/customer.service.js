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
   * @param {string} [params.sort] - Sort field
   * @param {string} [params.order='asc'] - Sort order (asc, desc)
   * @param {string} [params.search] - Search term
   * @returns {Promise<Object>} Customers data with pagination
   */
  getCustomers: async (params = {}) => {
    const response = await api.get('/admin/customers', { params });
    return response.data;
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
   * Get customer statistics
   * @returns {Promise<Object>} Customer statistics
   */
  getCustomerStatistics: async () => {
    const response = await api.get('/admin/customers/statistics');
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
  }
};

export default CustomerService;