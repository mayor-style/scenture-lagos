// src/services/admin/dashboard.service.js
import api from '../api';

/**
 * Helper to extract the nested data from our API response structure.
 * @param {object} response - The raw response object from axios.
 * @returns The actual data payload.
 */
const extractData = (response) => response.data?.data;

const DashboardService = {
  /**
   * Fetches the main dashboard summary, including metrics and chart data.
   * @param {object} params - Query parameters { startDate, endDate }.
   * @returns {Promise<object>} The dashboard summary data.
   */
  getDashboardSummary: async (params = {}) => {
    const response = await api.get('/admin/dashboard/summary', { params });
    return extractData(response);
  },

  /**
   * Fetches a list of the most recent orders.
   * @param {object} params - Query parameters, e.g., { limit: 5 }.
   * @returns {Promise<object>} An object containing the list of recent orders.
   */
  getRecentOrders: async (params = { limit: 5 }) => {
    const response = await api.get('/admin/dashboard/recent-orders', { params });
    return extractData(response);
  },

  /**
   * Fetches the unified activity feed.
   * @param {object} params - Query parameters, e.g., { limit: 10 }.
   * @returns {Promise<object>} An object containing the list of activities.
   */
  getActivityFeed: async (params = { limit: 10 }) => {
    const response = await api.get('/admin/dashboard/activity-feed', { params });
    return extractData(response);
  },
};

export default DashboardService;