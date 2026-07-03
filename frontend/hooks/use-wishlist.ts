"use client";

import * as React from "react";
import type { Product } from "@/lib/types";

let items: Product[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return items;
}

const WISHLIST_SERVER_SNAPSHOT: Product[] = [];

function getServerSnapshot() {
  return WISHLIST_SERVER_SNAPSHOT;
}

export function useWishlist() {
  const currentItems = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return React.useMemo(
    () => ({
      items: currentItems,
      addItem: (product: Product) => {
        if (!items.some((item) => item.id === product.id)) {
          items = [...items, product];
          emit();
        }
      },
      removeItem: (productId: string) => {
        items = items.filter((item) => item.id !== productId);
        emit();
      },
      isInWishlist: (productId: string) => currentItems.some((item) => item.id === productId),
      clearWishlist: () => {
        items = [];
        emit();
      },
    }),
    [currentItems]
  );
}
