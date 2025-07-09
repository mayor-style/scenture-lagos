import api from './api';

/**
 * Order service for user-facing e-commerce website
 */
const OrderService = {
  /**
   * Create a new order from cart
   * @param {Object} orderData - Order data
   * @param {Object} orderData.shippingAddress - Shipping address
   * @param {Object} orderData.billingAddress - Billing address
   * @param {string} orderData.paymentMethod - Payment method
   * @returns {Promise<Object>} Created order
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid order response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },


  /**
   * Get all orders for the current user
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} Orders data with pagination
   */
   getOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return {
        orders: Array.isArray(response.data?.orders) ? response.data.orders : [],
        total: Number.isFinite(response.data?.total) ? response.data.total : 0
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  /**
   * Get a single order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order data
   */
  getOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid order data');
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  /**
   * Cancel an order
   * @param {string} id - Order ID
   * @param {Object} cancelData - Cancellation data
   * @param {string} cancelData.reason - Cancellation reason
   * @returns {Promise<Object>} Cancelled order
   */
  cancelOrder: async (id, cancelData) => {
    try {
      const response = await api.post(`/orders/${id}/cancel`, cancelData);
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid cancellation response');
      }
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },

  /**
   * Process payment for an order
   * @param {string} id - Order ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment result
   */
   processPayment: async (id, paymentData) => {
    try {
      const response = await api.post(`/orders/${id}/payment`, paymentData);
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid payment response');
      }
      return response.data;
    } catch (error) {
      console.error(`Error processing payment for order ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to process payment');
    }
  },
  /**
   * Get payment methods
   * @returns {Promise<Object>} Available payment methods
   */
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/payment-methods');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  },
  /**
   * Track an order
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Tracking information
   */
  trackOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/tracking`);
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid tracking data');
      }
      return response.data;
    } catch (error) {
      console.error(`Error tracking order ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tracking information');
    }
  },

  /**
   * Request a return/refund
   * @param {string} id - Order ID
   * @param {Object} returnData - Return data
   * @param {string} returnData.reason - Return reason
   * @param {Array} returnData.items - Items to return
   * @returns {Promise<Object>} Return request result
   */
   requestReturn: async (id, returnData) => {
    try {
      const response = await api.post(`/orders/${id}/return`, returnData);
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid return response');
      }
      return response.data;
    } catch (error) {
      console.error(`Error requesting return for order ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to request return');
    }
  },

  /**
   * Get order invoice
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Invoice data
   */
   getOrderInvoice: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/invoice`);
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid invoice data');
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching invoice for order ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invoice');
    }
  },

};

export default OrderService;