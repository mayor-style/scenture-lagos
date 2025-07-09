import api from '../api';

/**
 * Order service for admin order operations
 */
const OrderService = {
  /**
   * Get all orders with pagination, sorting, and filtering
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.sort] - Sort field
   * @param {string} [params.order='asc'] - Sort order (asc, desc)
   * @param {string} [params.search] - Search term
   * @param {string} [params.status] - Filter by order status
   * @param {string} [params.dateFrom] - Filter by date from
   * @param {string} [params.dateTo] - Filter by date to
   * @returns {Promise<Object>} Orders data with pagination
   */
  getOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  /**
   * Get a single order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order data
   */
  getOrder: async (id) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order data
   */
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * Initiate refund for an order
   * @param {string} id - Order ID
   * @param {Object} refundData - Refund data
   * @param {number} refundData.amount - Refund amount
   * @param {string} refundData.reason - Refund reason
   * @returns {Promise<Object>} Refund confirmation
   */
  initiateRefund: async (id, refundData) => {
    const response = await api.post(`/admin/orders/${id}/refund`, refundData);
    return response.data;
  },

  /**
   * Add internal note to an order
   * @param {string} id - Order ID
   * @param {Object} noteData - Note data
   * @param {string} noteData.content - Note content
   * @returns {Promise<Object>} Updated order with notes
   */
  addOrderNote: async (id, noteData) => {
    const response = await api.post(`/admin/orders/${id}/notes`, noteData);
    return response.data;
  },

  /**
   * Get order notes
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order notes
   */
  getOrderNotes: async (id) => {
    const response = await api.get(`/admin/orders/${id}/notes`);
    return response.data;
  },

  /**
   * Delete an order note
   * @param {string} orderId - Order ID
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteOrderNote: async (orderId, noteId) => {
    const response = await api.delete(`/admin/orders/${orderId}/notes/${noteId}`);
    return response.data;
  },

  /**
   * Get order statistics
   * @param {Object} params - Query parameters
   * @param {string} [params.period='week'] - Period for statistics (day, week, month, year)
   * @returns {Promise<Object>} Order statistics
   */
  getOrderStatistics: async (params = { period: 'week' }) => {
    const response = await api.get('/admin/orders/statistics', { params });
    return response.data;
  },

  /**
 * Send order email to customer
 * @param {string} id - Order ID
 * @returns {Promise<Object>} Email confirmation
 */
sendOrderEmail: async (id) => {
  const response = await api.post(`/admin/orders/${id}/email`);
  return response.data;
}
};

export default OrderService;