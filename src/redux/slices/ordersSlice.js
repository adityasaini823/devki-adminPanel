import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_ENDPOINTS } from '../../config/axios';

// Fetch all orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async ({ page = 1, limit = 20, status = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDERS, {
        params: { page, limit, status: status || undefined },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, order_status, payment_status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(API_ENDPOINTS.ORDER_STATUS(id), {
        order_status,
        payment_status,
      });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order');
    }
  }
);

const initialState = {
  orders: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  error: null,
  updateLoading: false,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index].order_status = action.payload.order?.order_status;
          state.orders[index].payment_status = action.payload.order?.payment_status;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrdersError } = ordersSlice.actions;
export default ordersSlice.reducer;
