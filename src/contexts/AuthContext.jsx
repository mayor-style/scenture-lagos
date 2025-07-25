import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import AuthService from '../services/auth.service';

// Create context
const AuthContext = createContext();

/**
 * AuthProvider component to manage authentication state
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const {addToast} = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Only attempt to load user if we have a token
        if (AuthService.isAuthenticated()) {
          setLoading(true);
          const { data } = await AuthService.getCurrentUser();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        // Clear auth state if token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login a regular user
   * @param {Object} credentials - User credentials
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.login(credentials);
      setCurrentUser(response.data);
      addToast('Login successful', 'success');
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login an admin user
   * @param {Object} credentials - Admin credentials
   */
  const adminLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.adminLogin(credentials);
       setCurrentUser(response.data);
      addToast('Admin login successful', 'success');
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
useEffect(()=>{
  
}, [adminLogin])

  /**
   * Logout the current user
   */
  const logout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      setCurrentUser(null);
      addToast('Logged out successfully', 'success');
      
      // Redirect based on user role
      const userRole = localStorage.getItem('userRole');
      const isAdmin = userRole === 'admin' || userRole === 'superadmin';
      navigate(isAdmin ? '/admin/login' : '/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state even if API call fails
      setCurrentUser(null);
      
      // Redirect based on user role
      const userRole = localStorage.getItem('userRole');
      const isAdmin = userRole === 'admin' || userRole === 'superadmin';
      navigate(isAdmin ? '/admin/login' : '/login');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user details
   * @param {Object} userData - User data to update
   */
  const updateUserDetails = async (userData) => {
    try {
      setLoading(true);
      const response = await AuthService.updateDetails(userData);
      setCurrentUser(response.data);
      addToast('Profile updated successfully', 'success');
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user password
   * @param {Object} passwordData - Password data
   */
  const updatePassword = async (passwordData) => {
    try {
      setLoading(true);
      const response = await AuthService.updatePassword(passwordData);
      addToast('Password updated successfully', 'success');
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has required role
  const hasRole = (requiredRoles) => {
    if (!currentUser) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(currentUser.user.role);
    }
    
    return requiredRoles === currentUser.user.role;
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.register(userData);
      setCurrentUser(response.data);
      addToast('Registration successful', 'success');
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request password reset
   * @param {Object} email - User email
   */
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.forgotPassword(email);
      addToast('Password reset email sent', 'success');
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify reset token
   * @param {string} token - Reset token
   */
  const verifyResetToken = async (token) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.verifyResetToken(token);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password with token
   * @param {Object} data - Reset password data
   * @param {string} data.token - Reset token
   * @param {string} data.password - New password
   */
  const resetPassword = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.resetPassword(data);
      addToast('Password reset successful', 'success');
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    adminLogin,
    logout,
    updateDetails: updateUserDetails,
    updatePassword,
    register,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    isAuthenticated: !!currentUser,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;