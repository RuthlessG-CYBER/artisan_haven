import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/lib/types';

interface WishlistState {
  items: Product[];
}

const getInitialState = (): WishlistState => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('wishlist_store');
      if (stored) {
        return { items: JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to restore wishlist state', e);
    }
  }
  return { items: [] };
};

const persistState = (items: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wishlist_store', JSON.stringify(items));
  }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: getInitialState(),
  reducers: {
    addToWishlist: (state, action: PayloadAction<Product>) => {
      if (!state.items.find(item => item.id === action.payload.id)) {
        state.items.push(action.payload);
        persistState(state.items);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      persistState(state.items);
    },
  },
});

export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
