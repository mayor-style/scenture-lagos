import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/authentication
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle different error statuses
    if (response) {
      // Authentication errors
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          toast.error('Your session has expired. Please log in again.');
          window.location.href = '/admin/login';
        }
      }
      
      // Authorization errors
      else if (response.status === 403) {
        toast.error('You do not have permission to perform this action');
      }
      
      // Server errors
      else if (response.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
      
      // Other client errors
      else if (response.data && response.data.message) {
        toast.error(response.data.message);
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } else {
      // Network errors
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;