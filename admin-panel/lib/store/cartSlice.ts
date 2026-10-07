import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';
import type { CartItem, CakeCustomization } from '@/lib/types';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const res = await apiClient.getCart();
  if (res.error) throw new Error(res.error);
  return res.data || [];
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity, customization }: { productId: string; quantity: number; customization?: CakeCustomization }) => {
    const res = await apiClient.addToCart(productId, quantity, customization);
    if (res.error) throw new Error(res.error);
    const cartRes = await apiClient.getCart();
    return cartRes.data || [];
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
    const res = await apiClient.updateCartItem(itemId, quantity);
    if (res.error) throw new Error(res.error);
    const cartRes = await apiClient.getCart();
    return cartRes.data || [];
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string) => {
    const res = await apiClient.removeFromCart(itemId);
    if (res.error) throw new Error(res.error);
    const cartRes = await apiClient.getCart();
    return cartRes.data || [];
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState }) => {
    const state = getState() as { cart: CartState };
    for (const item of state.cart.items) {
      await apiClient.removeFromCart(item.id);
    }
    return [];
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch cart'; })
      
      .addCase(addToCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addToCart.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(addToCart.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to add item'; })

      .addCase(updateCartItem.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateCartItem.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(updateCartItem.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to update item'; })

      .addCase(removeFromCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(removeFromCart.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(removeFromCart.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to remove item'; })
      
      .addCase(clearCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(clearCart.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(clearCart.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to clear cart'; });
  },
});

export default cartSlice.reducer;
