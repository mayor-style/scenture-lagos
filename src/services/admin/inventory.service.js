import api from '../api';

/**
 * Inventory service for admin inventory operations
 */
const InventoryService = {
  /**
   * Get inventory overview with pagination, sorting, and filtering
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.sort] - Sort field
   * @param {string} [params.order='asc'] - Sort order (asc, desc)
   * @param {string} [params.search] - Search term
   * @param {string} [params.category] - Filter by category ID
   * @param {boolean} [params.lowStock] - Filter by low stock
   * @returns {Promise<Object>} Inventory data with pagination
   */
  getInventory: async (params = {}) => {
    const response = await api.get('/admin/inventory', { params });
    return response.data;
  },

  /**
   * Get a single inventory item by product ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Inventory item data
   */
  getInventoryItem: async (id) => {
    const response = await api.get(`/admin/inventory/${id}`);
    return response.data;
  },

  /**
   * Adjust inventory stock
   * @param {string} id - Product ID
   * @param {Object} adjustmentData - Adjustment data
   * @param {number} adjustmentData.quantity - Quantity to adjust (positive for increase, negative for decrease)
   * @param {string} adjustmentData.reason - Reason for adjustment
   * @returns {Promise<Object>} Updated inventory item
   */
  adjustStock: async (id, adjustmentData) => {
    const response = await api.put(`/admin/inventory/${id}/adjust`, adjustmentData);
    return response.data;
  },

  /**
   * Get inventory history for a product
   * @param {string} id - Product ID
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} Inventory history with pagination
   */
  getInventoryHistory: async (id, params = {}) => {
    const response = await api.get(`/admin/inventory/${id}/history`, { params });
    return response.data;
  },

  /**
   * Get inventory statistics
   * @returns {Promise<Object>} Inventory statistics
   */
  getInventoryStatistics: async () => {
    const response = await api.get('/admin/inventory/statistics');
    return response.data;
  },

  /**
   * Get low stock items
   * @param {Object} params - Query parameters
   * @param {number} [params.limit=10] - Number of items to return
   * @returns {Promise<Object>} Low stock items
   */
  getLowStockItems: async (params = { limit: 10 }) => {
    const response = await api.get('/admin/inventory/low-stock', { params });
    return response.data;
  },

  /**
   * Update inventory settings
   * @param {Object} settingsData - Settings data
   * @param {number} settingsData.lowStockThreshold - Low stock threshold
   * @returns {Promise<Object>} Updated settings
   */
  updateInventorySettings: async (settingsData) => {
    const response = await api.put('/admin/inventory/settings', settingsData);
    return response.data;
  },

  /**
   * Get inventory settings
   * @returns {Promise<Object>} Inventory settings
   */
  getInventorySettings: async () => {
    const response = await api.get('/admin/inventory/settings');
    return response.data;
  }
};

export default InventoryService;