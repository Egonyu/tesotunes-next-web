"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_ugx?: number;
  price_credits?: number;
  originalPrice?: number;
  image: string;
  image_url?: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  allow_hybrid_payment?: boolean;
}

interface ProductsFilters {
  searchQuery?: string;
  category?: string;
}

export function useStoreProducts(filters?: ProductsFilters) {
  return useQuery({
    queryKey: ["store-products", filters?.searchQuery, filters?.category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.searchQuery) params.append("search", filters.searchQuery);
      if (filters?.category && filters.category !== "all") {
        params.append("category", filters.category);
      }
      const queryString = params.toString();
      const endpoint = queryString
        ? `/store/products?${queryString}`
        : "/store/products";
      const res = await apiGet<{ data: Product[] }>(endpoint);
      return res.data;
    },
    retry: 2,
  });
}
