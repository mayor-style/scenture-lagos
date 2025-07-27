import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import AuthService from '../services/auth.service';

// Create context
const AuthContext = createContext(null);

/**
 * AuthProvider component to manage authentication state
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Primarily for the initial user load
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Helper function to clear session data from state and localStorage
  const clearSession = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('token');
  }, []);

  // Load user on initial mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // No need to set loading to true here, it's true by default
          const { data } = await AuthService.getCurrentUser();
          setCurrentUser(data);
        } catch (err) {
          console.error('Failed to load user with token:', err);
          // If token is invalid or expired, clear it
          clearSession();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [clearSession]);

  // Centralized function to handle successful authentication
  const handleSuccessfulAuth = useCallback((response, isAdmin = false) => {
    const { user, token } = response.data;
    
    // Set state and persist token
    setCurrentUser(response.data);
    localStorage.setItem('token', token);

    // Redirect based on role
    const effectiveRole = user.role;
    const redirectPath = effectiveRole === 'admin' || effectiveRole === 'superadmin' ? '/admin/dashboard' : '/';
    navigate(redirectPath);

    addToast('Login successful!', 'success');
  }, [navigate, addToast]);


  /**
   * Login a user (regular or admin)
   * @param {Object} credentials - User credentials
   * @param {boolean} isAdminLogin - Flag to distinguish between admin/regular login
   */
  const login = useCallback(async (credentials, isAdminLogin = false) => {
    setLoading(true);
    try {
      const response = isAdminLogin 
        ? await AuthService.adminLogin(credentials) 
        : await AuthService.login(credentials);
      
      handleSuccessfulAuth(response, isAdminLogin);
      return response;
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
      throw err; // Re-throw for local handling in components
    } finally {
      setLoading(false);
    }
  }, [handleSuccessfulAuth, addToast]);
  
  /**
   * Logout the current user
   */
  const logout = useCallback(async () => {
    const wasAdmin = currentUser?.user?.role === 'admin' || currentUser?.user?.role === 'superadmin';
    try {
      // Optimistically clear client state
      clearSession();
      addToast('Logged out successfully', 'success');
      navigate(wasAdmin ? '/admin/login' : '/login');
      
      // Attempt to invalidate token on the server
      await AuthService.logout();
    } catch (err) {
      console.error('Logout API call failed:', err);
      // Client state is already cleared, navigation is done.
      // No need for further action here.
    }
  }, [clearSession, navigate, addToast, currentUser]);

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await AuthService.register(userData);
      // Assuming registration logs the user in
      handleSuccessfulAuth(response); 
      addToast('Registration successful', 'success');
      return response;
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleSuccessfulAuth, addToast]);


  // --- Other Methods (Update Profile, Password, etc.) ---

  const updateUserDetails = useCallback(async (userData) => {
    try {
      const response = await AuthService.updateDetails(userData);
      setCurrentUser(prevUser => ({...prevUser, user: response.data.user }));
      addToast('Profile updated successfully', 'success');
      return response;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
      throw err;
    }
  }, [addToast]);

  const updatePassword = useCallback(async (passwordData) => {
    try {
      const response = await AuthService.updatePassword(passwordData);
      addToast('Password updated successfully', 'success');
      return response;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update password', 'error');
      throw err;
    }
  }, [addToast]);
  
  const forgotPassword = useCallback(async (email) => {
    try {
        const response = await AuthService.forgotPassword(email);
        addToast('Password reset email sent', 'success');
        return response;
    } catch (err) {
        addToast(err.response?.data?.message || 'Failed to send reset email', 'error');
        throw err;
    }
  }, [addToast]);
  
  const resetPassword = useCallback(async (data) => {
    try {
        const response = await AuthService.resetPassword(data);
        addToast('Password reset successful', 'success');
        navigate('/login'); // Navigate to login after successful reset
        return response;
    } catch (err) {
        addToast(err.response?.data?.message || 'Failed to reset password', 'error');
        throw err;
    }
  }, [addToast, navigate]);

  // Check if user has one of the required roles
  const hasRole = useCallback((requiredRoles) => {
    if (!currentUser) return false;
    const userRole = currentUser.user.role;
    return Array.isArray(requiredRoles) 
      ? requiredRoles.includes(userRole) 
      : requiredRoles === userRole;
  }, [currentUser]);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({
    currentUser,
    loading,
    login,
    logout,
    register,
    updateUserDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!currentUser,
    hasRole,
  }), [currentUser, loading, login, logout, register, updateUserDetails, updatePassword, forgotPassword, resetPassword, hasRole]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;