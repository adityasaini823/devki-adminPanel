import axios from 'axios';
import store from '../redux/store';
import { setCredentials, logout } from '../redux/slices/authSlice';

// Create axios instance with base URL from environment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor - adds access token from Redux state (memory)
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles token refresh on 401/403
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401/403 and not a refresh request, try to refresh token
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/refresh') &&
      !originalRequest.url.includes('/login')
    ) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken, admin } = response.data;

        // Update Redux store with new token
        store.dispatch(setCredentials({ accessToken, admin }));

        processQueue(null, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed - logout user
        store.dispatch(logout());

        // Redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API Endpoints - centralized
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/admin/login',
  REFRESH: '/api/admin/refresh',
  LOGOUT: '/api/admin/logout',

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
  SUBSCRIPTION_PRODUCTS: '/api/subscription-products',
  SUBSCRIPTION_PRODUCT_BY_ID: (id) => `/api/subscription-products/${id}`,

  // Wallet Transactions
  WALLET_TRANSACTIONS: '/api/admin/wallet-transactions',
  WALLET_TRANSACTION_STATUS: (id) => `/api/admin/wallet-transactions/${id}/status`,
};

export default api;
