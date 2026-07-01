import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/add', { productId, quantity });
    toast.success('Added to cart!');
    return data.cart;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to add to cart');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    return data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cart/${productId}`);
    toast.success('Item removed from cart');
    return data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart');
    return { items: [], totalItems: 0, totalPrice: 0 };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setLocalCart: (state, action) => {
      const cart = action.payload;
      state.items = cart?.items || [];
      state.totalItems = cart?.totalItems || 0;
      state.totalPrice = cart?.totalPrice || 0;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; };
    const handleCart = (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
      state.totalItems = action.payload?.totalItems || 0;
      state.totalPrice = action.payload?.totalPrice || 0;
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    [fetchCart, addToCart, updateCartItem, removeFromCart, clearCart].forEach(thunk => {
      builder.addCase(thunk.pending, handlePending);
      builder.addCase(thunk.fulfilled, handleCart);
      builder.addCase(thunk.rejected, handleRejected);
    });
  },
});

export const { setLocalCart } = cartSlice.actions;
export default cartSlice.reducer;
