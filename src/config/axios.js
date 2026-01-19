import axios from 'axios';

// Create axios instance with base URL from environment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401/403 - redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API Endpoints - centralized
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/admin/login',
  
  // Dashboard
  DASHBOARD_STATS: '/api/admin/dashboard/stats',
  
  // Users
  USERS: '/api/admin/users',
  USER_BY_ID: (id) => `/api/admin/users/${id}`,
  
  // Products
  PRODUCTS: '/api/admin/products',
  PRODUCT_BY_ID: (id) => `/api/products/${id}`,
  CREATE_PRODUCT: '/api/products',
  
  // Orders
  ORDERS: '/api/admin/orders',
  ORDER_STATUS: (id) => `/api/admin/orders/${id}/status`,
  
  // Subscriptions
  SUBSCRIPTIONS: '/api/admin/subscriptions',
  SUBSCRIPTION_STATUS: (id) => `/api/admin/subscriptions/${id}/status`,
  
  // Subscription Products
  SUBSCRIPTION_PRODUCTS: '/api/admin/subscription-products',
  
  // Wallet Transactions
  WALLET_TRANSACTIONS: '/api/admin/wallet-transactions',
  WALLET_TRANSACTION_STATUS: (id) => `/api/admin/wallet-transactions/${id}/status`,
};

export default api;
