"use client";

import * as React from "react";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "artisan-haven-wishlist";
let items: Product[] = [];
const listeners = new Set<() => void>();

function loadState() {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    items = raw ? (JSON.parse(raw) as Product[]) : [];
    if (!Array.isArray(items)) items = [];
  } catch {
    items = [];
  }
}

function emit() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
  listeners.forEach((listener) => listener());
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
  return items;
}

function getServerSnapshot() {
  return [];
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
