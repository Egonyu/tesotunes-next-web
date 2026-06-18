"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useStoreEnabled } from "@/hooks/usePlatformSettings";

interface StoreProductRecord {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  short_description?: string | null;
  price_ugx?: number | string | null;
  price_credits?: number | null;
  featured_image?: string | null;
  featured_image_url?: string | null;
  image_urls?: string[];
  category?: {
    id: number;
    name: string;
    slug?: string | null;
  } | null;
  store?: {
    name: string;
    slug: string;
  } | null;
  average_rating?: number | string | null;
  review_count?: number | null;
  inventory_quantity?: number | null;
  track_inventory?: boolean;
  allow_backorder?: boolean;
  allow_hybrid_payment?: boolean;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  price_ugx?: number;
  price_credits?: number;
  originalPrice?: number;
  image: string;
  image_url?: string;
  image_urls?: string[];
  category: string;
  category_id?: number;
  category_slug?: string;
  store?: {
    name: string;
    slug: string;
  } | null;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock_quantity: number;
  allow_hybrid_payment?: boolean;
}

interface ProductsFilters {
  searchQuery?: string;
  category?: string;
}

function normalizeStoreProduct(product: StoreProductRecord): Product {
  const stockQuantity = Number(product.inventory_quantity ?? 0);
  const imageUrl = product.featured_image_url || product.image_urls?.[0] || product.featured_image || "";

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.short_description || product.description || "",
    price: Number(product.price_ugx ?? 0),
    price_ugx: Number(product.price_ugx ?? 0),
    price_credits: product.price_credits ? Number(product.price_credits) : 0,
    image: imageUrl,
    image_url: imageUrl,
    image_urls: product.image_urls ?? [],
    category: product.category?.name ?? "Uncategorized",
    category_id: product.category?.id,
    category_slug: product.category?.slug ?? undefined,
    store: product.store ?? null,
    rating: Number(product.average_rating ?? 0),
    reviews: Number(product.review_count ?? 0),
    inStock: product.track_inventory === false || stockQuantity > 0 || !!product.allow_backorder,
    stock_quantity: stockQuantity,
    allow_hybrid_payment: product.allow_hybrid_payment,
  };
}

export function useStoreProducts(filters?: ProductsFilters) {
  const storeEnabled = useStoreEnabled();
  return useQuery({
    queryKey: ["store-products", filters?.searchQuery, filters?.category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.searchQuery) params.append("search", filters.searchQuery);
      if (filters?.category && filters.category !== "all") {
        params.append("category_id", filters.category);
      }
      const queryString = params.toString();
      const endpoint = queryString
        ? `/store/public/products?${queryString}`
        : "/store/public/products";
      const res = await apiGet<{ data: StoreProductRecord[] }>(endpoint);
      return res.data.map(normalizeStoreProduct);
    },
    enabled: storeEnabled,
    retry: 2,
  });
}
