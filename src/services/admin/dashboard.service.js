import api from '../api';

/**
 * Dashboard service for admin dashboard operations
 */
const DashboardService = {
  /**
   * Get dashboard summary data
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date for filtering data
   * @param {string} [params.endDate] - End date for filtering data
   * @returns {Promise<Object>} Dashboard summary data
   */
  getDashboardSummary: async (params = {}) => {
    try {
      const response = await api.get('/admin/dashboard/summary', { params });
      return {
        data: {
          metrics: response.data.metrics || {},
          charts: response.data.charts || { salesChart: [], orderStatusChart: [] },
          dateRange: response.data.dateRange || {}
        }
      };
    } catch (error) {
      console.error(`Error fetching dashboard summary: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  /**
   * Get recent orders for dashboard
   * @param {Object} params - Query parameters
   * @param {number} [params.limit=5] - Number of orders to return
   * @returns {Promise<Object>} Recent orders data
   */
  getRecentOrders: async (params = { limit: 5 }) => {
    try {
      const response = await api.get('/admin/dashboard/recent-orders', { params });
      return { data: { orders: response.data.orders || [] } };
    } catch (error) {
      console.error(`Error fetching recent orders: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  /**
   * Get activity feed for dashboard
   * @param {Object} params - Query parameters
   * @param {number} [params.limit=10] - Number of activities to return
   * @param {string} [params.type] - Activity type filter (product, order, inventory, customer)
   * @returns {Promise<Object>} Activity feed data
   */
  getActivityFeed: async (params = { limit: 10 }) => {
    try {
      const response = await api.get('/admin/dashboard/activity-feed', { params });
      return { data: { activities: response.data.activities || [] } };
    } catch (error) {
      console.error(`Error fetching activity feed: ${error.response?.status || error.message}`);
      throw error;
    }
  },

    /**
   * Get sales data for charts
   * @param {Object} params - Query parameters
   * @param {string} [params.period='week'] - Period for sales data (day, week, month, year)
   * @param {string} [params.startDate] - Start date for filtering data (YYYY-MM-DD)
   * @param {string} [params.endDate] - End date for filtering data (YYYY-MM-DD)
   * @returns {Promise<Object>} Sales data for charts
   */
  getSalesData: async (params = { period: 'week' }) => {
    try {
      const response = await api.get('/admin/dashboard/sales-data', { params });
      const salesChart = response.data.salesChart || [];

      const formattedData = salesChart.map(item => {
        const date = new Date(item.date);
        if (!item.date || isNaN(date.getTime())) {
          return { name: 'Unknown', sales: 0 };
        }

        let displayName;
        switch (params.period) {
          case 'week':
            displayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            break;
          case 'month':
            displayName = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
            break;
          case 'year':
            displayName = date.toLocaleDateString('en-US', { month: 'short' });
            break;
          default:
            displayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        }

        return {
          name: displayName,
          sales: item.sales || 0
        };
      });

      return { data: formattedData };
    } catch (error) {
      console.error(`Error fetching sales data: ${error.response?.status || error.message}`);
      return { data: [] };
    }
  }
  };

export default DashboardService;