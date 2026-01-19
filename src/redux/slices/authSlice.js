import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Async thunk for admin login
export const loginAdmin = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/login`,
        { email, password },
        { withCredentials: true } // Important: receive cookies
      );
      
      const { accessToken, admin } = response.data;
      
      // Only store admin info in sessionStorage (not tokens)
      sessionStorage.setItem('adminUser', JSON.stringify(admin));
      
      return { accessToken, admin };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Check auth state by refreshing token (using HTTP-only cookie)
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      // Try to refresh token using cookie
      const response = await axios.post(
        `${API_URL}/api/admin/refresh`,
        {},
        { withCredentials: true }
      );
      
      const { accessToken, admin } = response.data;
      
      // Update session storage
      sessionStorage.setItem('adminUser', JSON.stringify(admin));
      
      return { accessToken, admin };
    } catch (error) {
      // Clear any stale session data
      sessionStorage.removeItem('adminUser');
      return rejectWithValue('Session expired');
    }
  }
);

// Logout - call backend to clear cookie
export const logoutAdmin = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(
        `${API_URL}/api/admin/logout`,
        {},
        { withCredentials: true }
      );
      
      // Clear session storage
      sessionStorage.removeItem('adminUser');
      
      return true;
    } catch (error) {
      // Clear session storage anyway
      sessionStorage.removeItem('adminUser');
      return rejectWithValue('Logout failed');
    }
  }
);

const initialState = {
  isAuthenticated: false,
  admin: null,
  accessToken: null, // Stored in memory only (Redux state)
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set credentials from refresh
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.admin = action.payload.admin;
      state.isAuthenticated = true;
    },
    // Logout (sync action for interceptor)
    logout: (state) => {
      sessionStorage.removeItem('adminUser');
      state.isAuthenticated = false;
      state.admin = null;
      state.accessToken = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
      })
      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.admin = null;
        state.accessToken = null;
      })
      .addCase(logoutAdmin.rejected, (state) => {
        // Still clear state even if API call fails
        state.isAuthenticated = false;
        state.admin = null;
        state.accessToken = null;
      });
  },
});

export const { setCredentials, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
