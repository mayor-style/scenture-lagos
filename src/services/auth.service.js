import api from './api';

/**
 * Authentication service for handling user authentication operations
 */
const AuthService = {
  /**
   * Login a regular user
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User data and token
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAuthenticated', 'true');
    }
    return response.data;
  },

  /**
   * Login an admin user
   * @param {Object} credentials - Admin credentials
   * @param {string} credentials.email - Admin email
   * @param {string} credentials.password - Admin password
   * @returns {Promise<Object>} Admin user data and token
   */
  adminLogin: async (credentials) => {
    const response = await api.post('/auth/admin/login', credentials);
    if (response.data.success) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', response.data.data.user.role);
      console.log('admine enter', response.data.data.user.role);
    }
    console.log('admine done')
    return response.data;
  },

  /**
   * Get current user information
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Update user details
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  updateDetails: async (userData) => {
    const response = await api.put('/auth/updatedetails', userData);
    return response.data;
  },

  /**
   * Update user password
   * @param {Object} passwordData - Password data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Success message
   */
  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/updatepassword', passwordData);
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Success message
   */
  logout: async () => {
    try {
      // Call the backend logout endpoint
      const response = await api.get('/auth/logout');
      
      // Clear local storage regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      
      return response.data;
    } catch (error) {
      // Still clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  /**
   * Check if user has required role
   * @param {string|string[]} requiredRoles - Required role(s)
   * @returns {boolean} True if user has required role
   */
  hasRole: (requiredRoles) => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(userRole);
    }
    
    return requiredRoles === userRole;
  }
};

export default AuthService;