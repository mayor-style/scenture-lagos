import api from '../api';

/**
 * Order service for admin order operations
 */
const OrderService = {
  /**
   * Get all orders with pagination, sorting, and filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Orders data with pagination
   */
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/admin/orders', { params });
      return {
        orders: response.data.data,
        total: response.data.data.length
      };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch orders');
    }
  },

  /**
   * Get a single order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order data
   */
  getOrder: async (id) => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      console.log('Get single Order', response)
      return { order: response.data.data.order };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to fetch order');
    }
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order data
   */
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, { status });
      return { order: response.data.data.order };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update order status');
    }
  },

  /**
   * Initiate refund for an order
   * @param {string} id - Order ID
   * @param {Object} refundData - Refund data
   * @returns {Promise<Object>} Refund confirmation
   */
  initiateRefund: async (id, refundData) => {
    try {
      const response = await api.post(`/admin/orders/${id}/refund`, refundData);
      return { order: response.data.data.order };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to process refund');
    }
  },

  /**
   * Add internal note to an order
   * @param {string} id - Order ID
   * @param {Object} noteData - Note data
   * @returns {Promise<Object>} Updated order with notes
   */
  addOrderNote: async (id, noteData) => {
    try {
      const response = await api.post(`/admin/orders/${id}/notes`, noteData);
      return { order: response.data.data.order };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add note');
    }
  },

  /**
   * Send order email to customer
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Email confirmation
   */
  sendOrderEmail: async (id) => {
    try {
      const response = await api.post(`/admin/orders/${id}/email`);
      return { order: response.data.data.order };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to send email');
    }
  }
};

export default OrderService;