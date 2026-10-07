"use client";

import { useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { fetchCart, addToCart, removeFromCart, updateCartItem, clearCart as clearCartThunk } from '@/lib/store/cartSlice';
import type { CakeCustomization, CartItem } from '@/lib/types';

export function useCart() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const addItem = async (product: CartItem["product"], quantity: number, customization?: CakeCustomization) => {
    await dispatch(addToCart({ productId: product.id, quantity, customization })).unwrap();
  };

  const removeItem = async (itemId: string) => {
    await dispatch(removeFromCart(itemId)).unwrap();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    await dispatch(updateCartItem({ itemId, quantity })).unwrap();
  };

  const clearCart = async () => {
    await dispatch(clearCartThunk()).unwrap();
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return useMemo(() => ({
    items,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  }), [items, loading]);
}
