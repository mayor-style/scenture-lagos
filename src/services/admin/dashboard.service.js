// src/services/admin/dashboard.service.js
import api from '../api';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to handle the caching logic cleanly
const getOrFetch = async (key, fetcher) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  try {
    const response = await fetcher();
    const data = response.data?.data; // The data is nested under response.data.data
    if (!data) throw new Error('Invalid data structure from API');
    
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Error fetching data for key [${key}]:`, error);
    // On error, we re-throw to let the UI component handle it.
    // This gives you more control to display specific error messages.
    throw error;
  }
};

const DashboardService = {
  /**
   * Fetches the main dashboard summary, including metrics and chart data.
   * @param {object} params - Optional query parameters, e.g., { startDate, endDate }.
   */
  getDashboardSummary: async (params = {}) => {
    const cacheKey = `summary_${JSON.stringify(params)}`;
    return getOrFetch(cacheKey, () => api.get('/admin/dashboard/summary', { params }));
  },

  /**
   * Fetches a list of the most recent orders.
   * @param {object} params - Optional query parameters, e.g., { limit: 5 }.
   */
  getRecentOrders: async (params = { limit: 5 }) => {
    const cacheKey = `recent-orders_${JSON.stringify(params)}`;
    return getOrFetch(cacheKey, () => api.get('/admin/dashboard/recent-orders', { params }));
  },

  /**
   * Fetches the unified activity feed.
   * @param {object} params - Optional query parameters, e.g., { limit: 10 }.
   */
  getActivityFeed: async (params = { limit: 10 }) => {
    const cacheKey = `activity-feed_${JSON.stringify(params)}`;
    return getOrFetch(cacheKey, () => api.get('/admin/dashboard/activity-feed', { params }));
  },

  /**
   * Retrieves data directly from the cache if available and not expired.
   * @param {string} cacheKey - The key to look up in the cache.
   */
  getCachedData: (key) => {
    const cached = cache.get(key);
    return (cached && Date.now() - cached.timestamp < CACHE_TTL) ? cached.data : null;
  },

  /**
   * Clears the entire cache. Useful for manual refreshes.
   */
  clearCache: () => {
    console.log('Dashboard cache cleared.');
    cache.clear();
  },
};

export default DashboardService;