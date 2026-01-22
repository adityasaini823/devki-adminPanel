import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_ENDPOINTS } from '../../config/axios';

// Fetch all subscription products
export const fetchSubscriptionProducts = createAsyncThunk(
    'subscriptionProducts/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(API_ENDPOINTS.SUBSCRIPTION_PRODUCTS);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription products');
        }
    }
);

// Create subscription product
export const createSubscriptionProduct = createAsyncThunk(
    'subscriptionProducts/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post(API_ENDPOINTS.SUBSCRIPTION_PRODUCTS, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create subscription product');
        }
    }
);

// Update subscription product
export const updateSubscriptionProduct = createAsyncThunk(
    'subscriptionProducts/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.patch(API_ENDPOINTS.SUBSCRIPTION_PRODUCT_BY_ID(id), data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update subscription product');
        }
    }
);

// Delete subscription product
export const deleteSubscriptionProduct = createAsyncThunk(
    'subscriptionProducts/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(API_ENDPOINTS.SUBSCRIPTION_PRODUCT_BY_ID(id));
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete subscription product');
        }
    }
);

const initialState = {
    products: [],
    loading: false,
    error: null,
    actionLoading: false,
};

const subscriptionProductsSlice = createSlice({
    name: 'subscriptionProducts',
    initialState,
    reducers: {
        clearSubscriptionProductsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch products
            .addCase(fetchSubscriptionProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubscriptionProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products || [];
            })
            .addCase(fetchSubscriptionProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create product
            .addCase(createSubscriptionProduct.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(createSubscriptionProduct.fulfilled, (state, action) => {
                state.actionLoading = false;
                if (action.payload.product) {
                    state.products.push(action.payload.product);
                    // Sort by quantity logic if needed, but backend sorts
                }
            })
            .addCase(createSubscriptionProduct.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // Update product
            .addCase(updateSubscriptionProduct.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(updateSubscriptionProduct.fulfilled, (state, action) => {
                state.actionLoading = false;
                const index = state.products.findIndex(p => p.id === action.payload.product.id);
                if (index !== -1) {
                    state.products[index] = action.payload.product;
                }
            })
            .addCase(updateSubscriptionProduct.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // Delete product
            .addCase(deleteSubscriptionProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p.id !== action.payload);
            });
    },
});

export const { clearSubscriptionProductsError } = subscriptionProductsSlice.actions;
export default subscriptionProductsSlice.reducer;
