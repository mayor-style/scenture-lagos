import api from './api';

// A helper to consistently extract data or throw a formatted error
const handleResponse = (response) => {
  if (response.data && response.data.success) {
    // The actual payload is in the 'data' property of our success response
    return response.data.data || {};
  }
  // For cases where the success wrapper isn't used or for non-2xx responses
  return response.data;
};

const handleError = (error, defaultMessage = 'An unexpected error occurred.') => {
  console.error('API Error:', error);
  // Prioritize the structured error message from our backend's ErrorResponse middleware
  const message = error.response?.data?.error || defaultMessage;
  throw new Error(message);
};

const OrderService = {
  // Corresponds to POST /orders
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      console.log('from service', response)
      return handleResponse(response); // Returns { order }
    } catch (error) {
      handleError(error, 'Failed to create order');
    }
  },

  // Corresponds to GET /orders/shipping-rates
  getShippingRates: async (state) => {
    try {
      const response = await api.get('/orders/shipping-rates', { params: { state } });
      return handleResponse(response).shippingRates || []; // Returns the array of rates
    } catch (error) {
      handleError(error, 'Failed to fetch shipping rates');
    }
  },

  // Corresponds to GET /orders/my-orders (PRIVATE)
  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/my-orders');
      return handleResponse(response).orders || []; // Returns the array of orders
    } catch (error) {
      handleError(error, 'Failed to fetch your orders');
    }
  },

  // Corresponds to GET /orders/:id
  getOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return handleResponse(response).order; // Returns the single order object
    } catch (error) {
      handleError(error, 'Failed to fetch order details');
    }
  },

  // Corresponds to POST /orders/:id/cancel (PRIVATE)
  cancelOrder: async (id) => {
    try {
      const response = await api.post(`/orders/${id}/cancel`);
      return handleResponse(response); // Returns { order }
    } catch (error) {
      handleError(error, 'Failed to cancel order');
    }
  },

  // Corresponds to POST /orders/:id/initialize-payment
  initializePayment: async (id) => {
    try {
      const response = await api.post(`/orders/${id}/initialize-payment`);
      // This response includes the Paystack authorization_url
      return handleResponse(response);
    } catch (error) {
      handleError(error, 'Failed to initialize payment');
    }
  },

  // Corresponds to GET /orders/verify-payment/:reference
  verifyPayment: async (reference) => {
    try {
      const response = await api.get(`/orders/verify-payment/${reference}`);
      return handleResponse(response); // Returns { order } on success
    } catch (error) {
      handleError(error, 'Failed to verify payment');
    }
  },

  // Corresponds to GET /orders/payment-methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/orders/payment-methods');
      return handleResponse(response).paymentMethods || [];
    } catch (error) {
      handleError(error, 'Failed to fetch payment methods');
    }
  },

  // Corresponds to GET /orders/:id/tracking
  trackOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/tracking`);
      return handleResponse(response); // Returns { orderNumber, status, timeline }
    } catch (error) {
      handleError(error, 'Failed to fetch tracking information');
    }
  },

  // --- Methods for features not yet implemented in the backend ---
  // requestReturn: async (id, returnData) => { ... },
  // getOrderInvoice: async (id) => { ... },
};

export default OrderService;