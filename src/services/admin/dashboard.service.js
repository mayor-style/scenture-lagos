// src/services/admin/dashboard.service.js
import api from '../api';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const DashboardService = {
  getDashboardSummary: async (params = {}) => {
    const cacheKey = `summary_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/admin/dashboard/summary', { params });
      const data = response.data || {};
      const result = {
        data: {
          metrics: {
            totalSales: data.metrics?.totalSales || 0,
            totalOrders: data.metrics?.totalOrders || 0,
            inventoryValue: data.metrics?.inventoryValue || 0,
            newCustomers: data.metrics?.newCustomers || 0,
            salesGrowth: data.metrics?.salesGrowth || 0,
            ordersGrowth: data.metrics?.ordersGrowth || 0,
            customersGrowth: data.metrics?.customersGrowth || 0,
            lowStockProducts: data.metrics?.lowStockProducts || 0,
          },
          charts: data.charts || { salesChart: [], orderStatusChart: [] },
          dateRange: data.dateRange || {},
        },
      };
      cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error fetching dashboard summary: ${error.message}`);
      const defaultData = {
        data: {
          metrics: {
            totalSales: 0,
            totalOrders: 0,
            inventoryValue: 0,
            newCustomers: 0,
            salesGrowth: 0,
            ordersGrowth: 0,
            customersGrowth: 0,
            lowStockProducts: 0,
          },
          charts: { salesChart: [], orderStatusChart: [] },
          dateRange: {},
        },
      };
      cache.set(cacheKey, { data: defaultData.data, timestamp: Date.now() });
      return defaultData;
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
      const data = response.data || {};
      const result = { data: { orders: data.orders || [] } };
      cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error fetching recent orders: ${error.message}`);
      const defaultData = { data: { orders: [] } };
      cache.set(cacheKey, { data: defaultData.data, timestamp: Date.now() });
      return defaultData;
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
      const data = response.data || {};
      const result = { data: { activities: data.activities || [] } };
      cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error fetching activity feed: ${error.message}`);
      const defaultData = { data: { activities: [] } };
      cache.set(cacheKey, { data: defaultData.data, timestamp: Date.now() });
      return defaultData;
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
      const salesChart = response.data?.salesChart || [];
      const formattedData = salesChart.map((item) => {
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
      const result = { data: formattedData };
      cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error fetching sales data: ${error.message}`);
      const defaultData = { data: [] };
      cache.set(cacheKey, { data: defaultData.data, timestamp: Date.now() });
      return defaultData;
    }
  },

  getCachedData: (cacheKey) => {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  },

  clearCache: () => {
    cache.clear();
  },
};

export default DashboardService;