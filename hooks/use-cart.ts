"use client";

import * as React from "react";
import type { CakeCustomization, CartItem } from "@/lib/types";

interface CartState {
  items: CartItem[];
}

const STORAGE_KEY = "artisan-haven-cart";
let state: CartState = { items: [] };
const listeners = new Set<() => void>();

function loadState() {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CartState;
      state = { items: Array.isArray(parsed.items) ? parsed.items : [] };
    }
  } catch {
    state = { items: [] };
  }
}

function persistState() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function emit() {
  persistState();
  listeners.forEach((listener) => listener());
}

function setState(nextState: CartState) {
  state = nextState;
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    loadState();
  }

  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return { items: [] };
}

export function useCart() {
  const current = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return React.useMemo(
    () => ({
      items: current.items,
      addItem: (product: CartItem["product"], quantity: number, customization?: CakeCustomization) => {
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
          setState({ items: updatedItems });
          return;
        }

        setState({
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
        });
      },
      removeItem: (productId: string) => {
        setState({ items: state.items.filter((item) => item.product_id !== productId) });
      },
      updateQuantity: (productId: string, quantity: number) => {
        setState({
          items: state.items.map((item) =>
            item.product_id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        });
      },
      clearCart: () => setState({ items: [] }),
      getTotal: () =>
        state.items.reduce((total, item) => total + item.product.price * item.quantity, 0),
      getItemCount: () => state.items.reduce((count, item) => count + item.quantity, 0),
    }),
    [current.items]
  );
}
