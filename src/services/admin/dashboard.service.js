import api from '../api';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

const DashboardService = {
  getDashboardSummary: async (params = {}) => {
    const cacheKey = `summary_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/admin/dashboard/summary', { params });
      const data = {
        metrics: {
          totalSales: response.data.metrics?.totalSales || 0,
          totalOrders: response.data.metrics?.totalOrders || 0,
          inventoryValue: response.data.metrics?.inventoryValue || 0,
          newCustomers: response.data.metrics?.newCustomers || 0,
          salesGrowth: response.data.metrics?.salesGrowth || 0,
          ordersGrowth: response.data.metrics?.ordersGrowth || 0,
          customersGrowth: response.data.metrics?.customersGrowth || 0,
          lowStockProducts: response.data.metrics?.lowStockProducts || 0
        },
        charts: response.data.charts || { salesChart: [], orderStatusChart: [] },
        dateRange: response.data.dateRange || {}
      };
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return { data };
    } catch (error) {
      console.error(`Error fetching dashboard summary: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  getRecentOrders: async (params = { limit: 5 }) => {
    const cacheKey = `recent-orders_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/admin/dashboard/recent-orders', { params });
      const data = { orders: response.data.orders || [] };
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return { data };
    } catch (error) {
      console.error(`Error fetching recent orders: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  getActivityFeed: async (params = { limit: 10 }) => {
    const cacheKey = `activity-feed_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/admin/dashboard/activity-feed', { params });
      const data = { activities: response.data.activities || [] };
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return { data };
    } catch (error) {
      console.error(`Error fetching activity feed: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  getSalesData: async (params = { period: 'week' }) => {
    const cacheKey = `sales-data_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

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
        return { name: displayName, sales: item.sales || 0 };
      });
      const data = { data: formattedData };
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching sales data: ${error.response?.status || error.message}`);
      throw error;
    }
  }
};

export default DashboardService;