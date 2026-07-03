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

function mapApiProduct(item: Record<string, unknown>): Product {
  return {
    id: (item.id || item._id) as string,
    name: item.name as string,
    slug: item.slug as string,
    description: item.description as string | undefined,
    short_description: item.shortDescription as string | undefined,
    price: Number(item.price) || 0,
    compare_at_price: item.compareAtPrice ? Number(item.compareAtPrice) : undefined,
    product_type: (item.productType || item.product_type || "art_crafts") as Product["product_type"],
    featured_image: (item.featuredImage || item.featured_image || "") as string,
    images: (item.images as string[]) || [],
    category: item.category as Product["category"],
    stock_quantity: Number(item.stockQuantity ?? item.stock_quantity ?? 0),
    is_featured: Boolean(item.isFeatured ?? item.is_featured),
    is_best_seller: Boolean(item.isBestSeller ?? item.is_best_seller),
    sustainability_score: item.sustainabilityScore as number | undefined,
    nutritional_info: (item.nutritionalInfo || item.nutritional_info) as Product["nutritional_info"],
    ingredients: item.ingredients as string[] | undefined,
    created_at: (item.createdAt || item.created_at) as string | undefined,
  };
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params: Record<string, string> = {};
    if (options.product_type) params.product_type = options.product_type;
    if (options.is_featured) params.is_featured = "true";
    if (options.is_best_seller) params.is_best_seller = "true";
    if (options.limit) params.limit = String(options.limit);
    if (options.search) params.search = options.search;
    if (options.sort) params.sort = options.sort;
    if (options.min_price !== undefined) params.min_price = String(options.min_price);
    if (options.max_price !== undefined) params.max_price = String(options.max_price);
    if (options.in_stock) params.in_stock = "true";

    apiClient.getProducts(params).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.data && Array.isArray(res.data)) {
        setProducts(res.data.map(mapApiProduct));
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
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
    if (!slug) return;
    let cancelled = false;
    setLoading(true);

    apiClient.getProduct(slug).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.data) {
        setProduct(mapApiProduct(res.data as Record<string, unknown>));
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [slug]);

  return { product, loading };
}
