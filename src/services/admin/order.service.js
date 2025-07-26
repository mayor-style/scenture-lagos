// src/services/OrderService.js

import api from '../api'; // Assuming this is your configured Axios instance

/**
 * Order service for admin order operations
 */
const OrderService = {
  /**
   * Get all orders with pagination, sorting, and filtering
   * @param {Object} params - Query parameters (e.g., { page: 1, limit: 10, status: 'pending', search: 'john' })
   * @returns {Promise<Object>} Orders data with pagination: { orders: [...], total: N, limit: M, page: P, pages: Q }
   */
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/admin/orders', { params });
      // Assuming your backend's paginate utility returns data in response.data.data
      // and pagination details in response.data.pagination
      return {
        orders: response.data.data,
        total: response.data.pagination?.total || 0, // Correctly get total from pagination object
        limit: response.data.pagination?.limit || params.limit || 10, // Default to 10 if not provided
        page: response.data.pagination?.page || params.page || 1, // Default to 1 if not provided
        pages: response.data.pagination?.pages || 0, // Total pages
      };
    } catch (err) {
      console.error('OrderService.getOrders error:', err.response?.data || err.message);
      // Use err.response?.data?.message for consistency with backend ErrorResponse
      throw new Error(err.response?.data?.message || 'Failed to fetch orders');
    }
  },

  /**
   * Get a single order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order data: { order: {...} }
   */
  getOrder: async (id) => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      // The backend returns { order: {} } wrapped in data: { data: { order: {} } }
      // So, response.data.data.order is correct.
      // console.log('Get single Order', response); // Keep for debugging, remove for production
      return { order: response.data.data.order };
    } catch (err) {
      console.error(`OrderService.getOrder (${id}) error:`, err.response?.data || err.message);
      // Use err.response?.data?.message for consistency
      throw new Error(err.response?.data?.message || 'Failed to fetch order');
    }
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status (e.g., 'shipped', 'delivered')
   * @returns {Promise<Object>} Updated order data: { order: {...} }
   */
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, { status });
      return { order: response.data.data.order };
    } catch (err) {
      console.error(`OrderService.updateOrderStatus (${id}, ${status}) error:`, err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to update order status');
    }
  },

  /**
   * Initiate refund for an order
   * @param {string} id - Order ID
   * @param {Object} refundData - Refund data { amount: number, reason: string }
   * @returns {Promise<Object>} Refund confirmation: { order: {...} }
   */
  initiateRefund: async (id, refundData) => {
    try {
      const response = await api.post(`/admin/orders/${id}/refund`, refundData);
      return { order: response.data.data.order };
    } catch (err) {
      console.error(`OrderService.initiateRefund (${id}) error:`, err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to process refund');
    }
  },

  /**
   * Add internal note to an order
   * @param {string} id - Order ID
   * @param {Object} noteData - Note data { content: string, isInternal: boolean }
   * @returns {Promise<Object>} Updated order with notes: { order: {...} }
   */
  addOrderNote: async (id, noteData) => {
    try {
      const response = await api.post(`/admin/orders/${id}/notes`, noteData);
      return { order: response.data.data.order };
    } catch (err) {
      console.error(`OrderService.addOrderNote (${id}) error:`, err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to add note');
    }
  },

  /**
   * Send order email to customer
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Email confirmation: { order: {...} }
   */
  sendOrderEmail: async (id) => {
    try {
      const response = await api.post(`/admin/orders/${id}/email`);
      return { order: response.data.data.order };
    } catch (err) {
      console.error(`OrderService.sendOrderEmail (${id}) error:`, err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to send email');
    }
  }
};

export default OrderService;