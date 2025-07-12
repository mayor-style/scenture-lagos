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
  
console.log('current user', currentUser)
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
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state even if API call fails
      setCurrentUser(null);
      navigate('/admin/login');
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

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    adminLogin,
    logout,
    updateUserDetails,
    updatePassword,
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