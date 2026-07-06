import axios from 'axios';

// Create custom axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request Interceptor: Automatically inject tokens
API.interceptors.request.use(
  (config) => {
    // Check if browser is on admin route or requesting admin endpoint
    const isBrowserOnAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const isAdminRoute = isBrowserOnAdmin || config.url.includes('/admin') || config.url.includes('/orders/admin');
    
    if (isAdminRoute) {
      const adminToken = localStorage.getItem('vks_admin_token');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      const userToken = localStorage.getItem('vks_token');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (like token expiration)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Auto logout if unauthorized (401)
    if (error.response && error.response.status === 401) {
      const isUrlAdmin = error.config.url.includes('/admin') || error.config.url.includes('/orders/admin');
      if (isUrlAdmin) {
        localStorage.removeItem('vks_admin');
        localStorage.removeItem('vks_admin_token');
        // Let the state listener handle the logout state
      } else {
        localStorage.removeItem('vks_user');
        localStorage.removeItem('vks_token');
      }
    }
    
    return Promise.reject(message);
  }
);

export default API;
