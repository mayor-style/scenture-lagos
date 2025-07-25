import api from '../api';

// ✅ CORRECT: A map to reliably convert frontend status to backend query status
const STATUS_MAP = {
  in_stock: 'in',
  low_stock: 'low',
  out_of_stock: 'out',
};

/**
 * Inventory service for admin inventory operations
 */
const InventoryService = {
  /**
   * Get inventory items, summary, and totals with pagination and filtering.
   * This is now the primary function for fetching inventory data.
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise<Object>} - The full data object from the API
   */
  getInventory: async (params = {}) => {
    try {
      const mappedParams = { ...params };
      if (params.status && STATUS_MAP[params.status]) {
        mappedParams.stockStatus = STATUS_MAP[params.status];
        delete mappedParams.status;
      }
      const response = await api.get('/admin/inventory', { params: mappedParams });
      // ✅ OPTIMIZED: Return the entire data payload so the UI can get everything in one go.
      return response.data?.data || {};
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  /**
   * Get a single inventory item by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} - Product data
   */
  getInventoryItem: async (id) => {
    try {
      const response = await api.get(`/admin/inventory/${id}`);
      return response.data?.data?.product || {};
    } catch (error) {
      console.error(`Error fetching inventory item ${id}:`, error);
      throw error;
    }
  },

  /**
   * Adjust stock quantity for a product or variant
   * @param {string} id - Product ID
   * @param {Object} adjustmentData - { adjustment, reason, variantId }
   * @returns {Promise<Object>} - Updated product data
   */
  adjustStock: async (id, adjustmentData) => {
    try {
      // ✅ CORRECT: The payload now directly matches the backend's expectation.
      const response = await api.put(`/admin/inventory/${id}/adjust`, adjustmentData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error adjusting stock for product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get stock adjustment history for a product
   * @param {string} id - Product ID
   * @returns {Promise<Object>} - Stock adjustment history
   */
  getInventoryHistory: async (id) => {
    try {
      const response = await api.get(`/admin/inventory/${id}/history`);
      return response.data?.data || {};
    } catch (error) {
      console.error(`Error fetching inventory history for product ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * ❌ REMOVED: getInventoryStatistics is no longer needed.
   * The stats are now included in the getInventory response.
   */

  /**
   * Get low stock items
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Low stock items
   */
  getLowStockItems: async (params = { limit: 10 }) => {
    try {
      const response = await api.get('/admin/inventory/low-stock', { params });
      return response.data?.data || { items: [] };
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  },

  /**
   * Generate inventory report as PDF
   * @returns {Promise<Blob>} - PDF report as blob
   */
  generateReport: async () => {
    try {
      const response = await api.get('/admin/inventory/report', { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error('Error generating inventory report:', error);
      throw error;
    }
  },

  /**
   * Export inventory data as CSV
   * @returns {Promise<Blob>} - CSV data as blob
   */
  exportCSV: async () => {
    try {
      const response = await api.get('/admin/inventory/export', { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error('Error exporting inventory CSV:', error);
      throw error;
    }
  },
};

export default InventoryService;