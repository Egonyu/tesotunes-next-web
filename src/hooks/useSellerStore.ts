"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost, apiPostForm, apiPut } from "@/lib/api";

export interface SellerStore {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string | null;
  status: "draft" | "pending" | "active" | "suspended" | "closed";
  store_type: "artist" | "user";
  subscription_tier: "free" | "premium" | "business";
  owner_name?: string | null;
  total_orders?: number;
  products_count?: number;
  active_products_count?: number;
}

export interface SellerStoreStats {
  total_sales_ugx: number;
  total_sales_credits: number;
  total_orders: number;
  products_count: number;
  active_products: number;
  pending_orders: number;
  average_rating: number;
  reviews_count: number;
  weekly_sales: number[];
  daily_sales: number[];
  order_growth: number;
}

export interface SellerStoreCategory {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
}

export interface SellerStoreProduct {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string | null;
  product_type: string;
  status: "draft" | "active" | "archived" | "out_of_stock";
  price_ugx: number;
  price_credits: number;
  inventory_quantity: number;
  stock_quantity?: number;
  review_count?: number;
  total_sales?: number;
  featured_image_url?: string | null;
  featured_image?: string | null;
  image_urls?: string[];
  category?: {
    id: number;
    name: string;
  } | null;
}

export interface SellerStoreOrder {
  id: number;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status?: string;
  total_ugx?: number;
  total_amount?: number;
  created_at: string;
  user?: {
    id: number;
    display_name?: string;
    email?: string;
  };
  store?: {
    id: number;
    name: string;
    slug: string;
  };
  items?: Array<{
    id?: number;
    product_name?: string;
    quantity: number;
  }>;
}

export interface CreateStorePayload {
  name: string;
  description?: string;
  owner_mode?: "artist" | "user";
}

export interface CreateSellerProductPayload {
  name: string;
  description: string;
  category_id: number;
  product_type: string;
  price_ugx: number;
  inventory_quantity: number;
  track_inventory?: boolean;
  allow_backorder?: boolean;
  short_description?: string;
  sku?: string;
  images?: File[];
}

export interface UpdateSellerProductPayload {
  name?: string;
  description?: string;
  category_id?: number;
  product_type?: string;
  price_ugx?: number;
  inventory_quantity?: number;
  track_inventory?: boolean;
  allow_backorder?: boolean;
  short_description?: string;
  sku?: string;
  status?: string;
  images?: File[];
}

function buildSellerProductFormData(
  payload: CreateSellerProductPayload | UpdateSellerProductPayload
): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "images" && Array.isArray(value)) {
      value.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

export function useSellerStores() {
  return useQuery({
    queryKey: ["seller-store", "stores"],
    queryFn: async () => {
      const response = await apiGet<{ data: SellerStore[] }>("/store/seller/stores");
      return response.data;
    },
  });
}

export function useCreateSellerStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStorePayload) => {
      const response = await apiPost<{ data: SellerStore }>("/store/seller/stores", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-store", "stores"] });
    },
  });
}

export function useSellerStoreStats(storeSlug?: string) {
  return useQuery({
    queryKey: ["seller-store", "stats", storeSlug],
    queryFn: async () => {
      const response = await apiGet<{ data: SellerStoreStats }>(`/store/seller/stores/${storeSlug}/statistics`);
      return response.data;
    },
    enabled: !!storeSlug,
  });
}

export function useSellerStoreCategories() {
  return useQuery({
    queryKey: ["seller-store", "categories"],
    queryFn: async () => {
      const response = await apiGet<{ data: SellerStoreCategory[] }>("/store/public/categories");
      return response.data;
    },
  });
}

export function useSellerStoreProducts(storeSlug?: string) {
  return useQuery({
    queryKey: ["seller-store", "products", storeSlug],
    queryFn: async () => {
      const response = await apiGet<{ data: SellerStoreProduct[] }>(`/store/seller/stores/${storeSlug}/products`);
      return response.data;
    },
    enabled: !!storeSlug,
  });
}

export function useCreateSellerProduct(storeSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSellerProductPayload) => {
      if (!storeSlug) {
        throw new Error("Store is required");
      }

      const response = await apiPostForm<{ data: SellerStoreProduct }>(
        `/store/seller/stores/${storeSlug}/products`,
        buildSellerProductFormData(payload)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-store", "products", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["seller-store", "stats", storeSlug] });
    },
  });
}

export function useUpdateSellerProduct(storeSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      payload,
    }: {
      productId: number;
      payload: UpdateSellerProductPayload;
    }) => {
      if (!storeSlug) {
        throw new Error("Store is required");
      }

      const formData = buildSellerProductFormData(payload);
      formData.append("_method", "PUT");

      const response = await apiPostForm<{ data: SellerStoreProduct }>(
        `/store/seller/stores/${storeSlug}/products/${productId}`,
        formData
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-store", "products", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["seller-store", "stats", storeSlug] });
    },
  });
}

export function useActivateSellerProduct(storeSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      if (!storeSlug) {
        throw new Error("Store is required");
      }

      return apiPost(`/store/seller/stores/${storeSlug}/products/${productId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-store", "products", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["seller-store", "stats", storeSlug] });
    },
  });
}

export function useArchiveSellerProduct(storeSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      if (!storeSlug) {
        throw new Error("Store is required");
      }

      return apiPost(`/store/seller/stores/${storeSlug}/products/${productId}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-store", "products", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["seller-store", "stats", storeSlug] });
    },
  });
}

export function useDeleteSellerProduct(storeSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      if (!storeSlug) {
        throw new Error("Store is required");
      }

      return apiDelete(`/store/seller/stores/${storeSlug}/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-store", "products", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["seller-store", "stats", storeSlug] });
    },
  });
}

export function useSellerStoreOrders(storeSlug?: string) {
  return useQuery({
    queryKey: ["seller-store", "orders", storeSlug],
    queryFn: async () => {
      const response = await apiGet<{ data: SellerStoreOrder[] }>("/store/seller/orders", {
        params: storeSlug ? { store: storeSlug } : undefined,
      });
      return response.data;
    },
    enabled: !!storeSlug,
  });
}

export function useUpdateSellerOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderNumber,
      status,
    }: {
      storeSlug: string;
      orderNumber: string;
      status: string;
    }) => {
      return apiPut(`/store/seller/orders/${orderNumber}/status`, { status });
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["seller-store", "orders", variables.storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["seller-store", "stats", variables.storeSlug] });
    },
  });
}
