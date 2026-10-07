"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import type { Product } from "@/lib/types";

interface UseProductsOptions {
  product_type?: string;
  is_featured?: boolean;
  is_best_seller?: boolean;
  limit?: number;
  search?: string;
  sort?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchProducts = async () => {
      // Clean up options to string values for API
      const params: Record<string, string> = {};
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params[key] = String(value);
        }
      });

      const res = await apiClient.getProducts(params);
      if (isMounted) {
        setProducts(res.data || []);
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [
    options.product_type,
    options.is_featured,
    options.is_best_seller,
    options.limit,
    options.search,
    options.sort,
    options.min_price,
    options.max_price,
    options.in_stock,
  ]);

  return { products, loading };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!slug) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchProduct = async () => {
      const res = await apiClient.getProduct(slug);
      if (isMounted) {
        setProduct(res.data || null);
        setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { product, loading };
}
