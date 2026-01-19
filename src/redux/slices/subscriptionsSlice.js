import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_ENDPOINTS } from '../../config/axios';

// Fetch all subscriptions
export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchAll',
  async ({ page = 1, limit = 20, status = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.SUBSCRIPTIONS, {
        params: { page, limit, status: status || undefined },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }
);

// Update subscription status
export const updateSubscriptionStatus = createAsyncThunk(
  'subscriptions/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(API_ENDPOINTS.SUBSCRIPTION_STATUS(id), { status });
      return { id, status: response.data.subscription?.status };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subscription');
    }
  }
);

const initialState = {
  subscriptions: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  error: null,
  updateLoading: false,
};

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearSubscriptionsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload.subscriptions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update subscription status
      .addCase(updateSubscriptionStatus.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateSubscriptionStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.subscriptions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.subscriptions[index].status = action.payload.status;
        }
      })
      .addCase(updateSubscriptionStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubscriptionsError } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
