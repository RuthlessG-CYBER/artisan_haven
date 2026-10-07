"use client";

import { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { addToWishlist, removeFromWishlist } from '@/lib/store/wishlistSlice';
import type { Product } from '@/lib/types';

export function useWishlist() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.wishlist.items);

  const addItem = (product: Product) => {
    dispatch(addToWishlist(product));
  };

  const removeItem = (productId: string) => {
    dispatch(removeFromWishlist(productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    // For clearWishlist, we can dispatch multiple or create a clearWishlist action
    // but the slice only has removeFromWishlist. Let's iterate.
    items.forEach(item => dispatch(removeFromWishlist(item.id)));
  };

  return useMemo(() => ({
    items,
    addItem,
    removeItem,
    isInWishlist,
    clearWishlist,
  }), [items, dispatch]);
}
