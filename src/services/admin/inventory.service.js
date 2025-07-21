import api from '../api';

/**
 * Inventory service for admin inventory operations
 */
const InventoryService = {
  /**
   * Get inventory items with pagination and filtering
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise<Object>} - Inventory items and total count
   */
  getInventory: async (params = {}) => {
    try {
      const mappedParams = { ...params };
      if (params.status) {
        mappedParams.stockStatus = params.status.replace('_', '');
        delete mappedParams.status;
      }
      const response = await api.get('/admin/inventory', { params: mappedParams });
      console.log('getting invento', response)
      return {
        items: response.data?.data.items || [],
        total: response.data?.data.total || 0,
      };
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
      return response.data?.data.product || {};
    } catch (error) {
      console.error(`Error fetching inventory item ${id}:`, error);
      throw error;
    }
  },

  /**
   * Adjust stock quantity for a product or variant
   * @param {string} id - Product ID
   * @param {Object} adjustmentData - Adjustment data
   * @returns {Promise<Object>} - Updated product data
   */
  adjustStock: async (id, adjustmentData) => {
    try {
      const response = await api.put(`/admin/inventory/${id}/adjust`, {
        adjustment: adjustmentData.quantity,
        reason: adjustmentData.reason,
        variantId: adjustmentData.variantId || null,
        allowNegative: false,
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error adjusting stock for product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get stock adjustment history for a product
   * @param {string} id - Product ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Stock adjustment history
   */
  getInventoryHistory: async (id, params = {}) => {
    try {
      const response = await api.get(`/admin/inventory/${id}/history`, { params });
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching inventory history for product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get inventory statistics
   * @returns {Promise<Object>} - Inventory statistics
   */
  getInventoryStatistics: async () => {
    try {
      const response = await api.get('/admin/inventory', { params: { page: 1, limit: 1 } });
      const { summary, totalInventoryValue } = response.data?.data || response.data;
      return {
        totalProducts: summary?.totalProducts || 0,
        inStockCount: summary?.totalProducts - (summary?.lowStockProducts || 0) - (summary?.outOfStockProducts || 0),
        lowStockCount: summary?.lowStockProducts || 0,
        outOfStockCount: summary?.outOfStockProducts || 0,
        totalValue: totalInventoryValue || 0,
      };
    } catch (error) {
      console.error('Error fetching inventory statistics:', error);
      throw error;
    }
  },

  /**
   * Get low stock items
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Low stock items
   */
  getLowStockItems: async (params = { limit: 10 }) => {
    try {
      const response = await api.get('/admin/inventory/low-stock', { params });
      return { items: response.data?.data.items || response.data.items ||  [] };
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
      return response.data?.data || response.data;
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
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error exporting inventory CSV:', error);
      throw error;
    }
  },
};

export default InventoryService;