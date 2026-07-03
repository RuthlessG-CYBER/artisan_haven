"use client";

import * as React from "react";
import type { CakeCustomization, CartItem } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "./use-auth-store";

interface CartState {
  items: CartItem[];
}

let state: CartState = { items: [] };
let hasLoadedFromApi = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return state;
}

const CART_SERVER_SNAPSHOT: CartState = { items: [] };

function getServerSnapshot() {
  return CART_SERVER_SNAPSHOT;
}

export function useCart() {
  const current = React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot,
    getServerSnapshot
  );

  const { isAuthenticated, user } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated && user && !hasLoadedFromApi) {
      hasLoadedFromApi = true;
      apiClient.getCart().then((res) => {
        if (res.data && Array.isArray(res.data)) {
          const mapped: CartItem[] = (res.data as Array<Record<string, unknown>>).map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            user_id: user.id,
            product_id: item.product_id || item.productId,
            variant_id: item.variant_id || null,
            quantity: item.quantity || 1,
            customization_data: (item.customization_data || item.customizationData || null) as CakeCustomization | null,
            product: item.product || item.product_id,
          }));
          if (mapped.length > 0) {
            state = { items: mapped };
            emit();
          }
        }
      }).catch(() => {});
    }
    if (!isAuthenticated) {
      hasLoadedFromApi = false;
    }
  }, [isAuthenticated, user]);

  return React.useMemo(
    () => ({
      items: current.items,
      addItem: async (product: CartItem["product"], quantity: number, customization?: CakeCustomization) => {
        if (isAuthenticated) {
          const res = await apiClient.addToCart(product.id, quantity, customization as Record<string, unknown> | undefined);
          if (res.error) return;
        }

        const existingIndex = state.items.findIndex(
          (item) =>
            item.product_id === product.id &&
            JSON.stringify(item.customization_data) === JSON.stringify(customization ?? null)
        );

        if (existingIndex > -1) {
          const updatedItems = [...state.items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + quantity,
          };
          state = { items: updatedItems };
        } else {
          state = {
            items: [
              ...state.items,
              {
                id: crypto.randomUUID(),
                user_id: null,
                product_id: product.id,
                variant_id: null,
                quantity,
                customization_data: customization ?? null,
                product,
              },
            ],
          };
        }
        emit();
      },
      removeItem: async (productId: string) => {
        if (isAuthenticated) {
          const item = state.items.find((i) => i.product_id === productId);
          if (item) {
            await apiClient.removeFromCart(item.id).catch(() => {});
          }
        }
        state = { items: state.items.filter((item) => item.product_id !== productId) };
        emit();
      },
      updateQuantity: async (productId: string, quantity: number) => {
        if (isAuthenticated) {
          const item = state.items.find((i) => i.product_id === productId);
          if (item) {
            await apiClient.updateCartItem(item.id, Math.max(1, quantity)).catch(() => {});
          }
        }
        state = {
          items: state.items.map((item) =>
            item.product_id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        };
        emit();
      },
      clearCart: async () => {
        if (isAuthenticated && state.items.length > 0) {
          await Promise.all(state.items.map((item) => apiClient.removeFromCart(item.id).catch(() => {})));
        }
        state = { items: [] };
        emit();
      },
      getTotal: () =>
        state.items.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0),
      getItemCount: () => state.items.reduce((count, item) => count + item.quantity, 0),
    }),
    [current.items, isAuthenticated]
  );
}
