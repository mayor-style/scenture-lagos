import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://scenture-lagos-server.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/authentication
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        if (!window.location.pathname.includes('/login')) {
          console.error('Authentication error: Session expired. Redirecting to login.');
          window.location.href = '/admin/login';
        }
      } else if (response.status === 403) {
        console.error('Authorization error: You do not have permission to perform this action.');
      } else if (response.status >= 500) {
        console.error('Server error: Please try again later.');
      } else if (response.data && response.data.message) {
        console.error(`Client error: ${response.data.message}`);
      } else {
        console.error('Client error: An error occurred. Please try again.');
      }
    } else {
      console.error('Network error: Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;