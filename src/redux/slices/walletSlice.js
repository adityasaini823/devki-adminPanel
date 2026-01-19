import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_ENDPOINTS } from '../../config/axios';

// Fetch all wallet transactions
export const fetchWalletTransactions = createAsyncThunk(
  'wallet/fetchAll',
  async ({ page = 1, limit = 20, status = '', transaction_type = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.WALLET_TRANSACTIONS, {
        params: {
          page,
          limit,
          status: status || undefined,
          transaction_type: transaction_type || undefined,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// Update wallet transaction status
export const updateWalletTransactionStatus = createAsyncThunk(
  'wallet/updateStatus',
  async ({ id, status, admin_remarks }, { rejectWithValue }) => {
    try {
      const response = await api.patch(API_ENDPOINTS.WALLET_TRANSACTION_STATUS(id), {
        status,
        admin_remarks,
      });
      return { id, ...response.data.transaction };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction');
    }
  }
);

const initialState = {
  transactions: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  error: null,
  updateLoading: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchWalletTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchWalletTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update transaction status
      .addCase(updateWalletTransactionStatus.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateWalletTransactionStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index].status = action.payload.status;
          state.transactions[index].admin_remarks = action.payload.admin_remarks;
        }
      })
      .addCase(updateWalletTransactionStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;
