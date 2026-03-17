"use client";

export interface StoreProductLike {
  id?: number;
  slug?: string | null;
  title?: string | null;
  name?: string | null;
  price?: number | string | null;
  price_ugx?: number | string | null;
  image_url?: string | null;
  featured_image_url?: string | null;
  featured_image?: string | null;
  stock_quantity?: number | null;
  inventory_quantity?: number | null;
  in_stock?: boolean;
  average_rating?: number | string | null;
  rating?: number | string | null;
  review_count?: number | null;
  reviews_count?: number | null;
}

export function getStoreProductName(product?: StoreProductLike | null): string {
  return product?.name || product?.title || "Product";
}

export function getStoreProductPrice(product?: StoreProductLike | null): number {
  return Number(product?.price_ugx ?? product?.price ?? 0);
}

export function getStoreProductImage(product?: StoreProductLike | null): string | null {
  return product?.featured_image_url || product?.image_url || product?.featured_image || null;
}

export function getStoreProductStock(product?: StoreProductLike | null): number {
  return Number(product?.inventory_quantity ?? product?.stock_quantity ?? 0);
}

export function isStoreProductInStock(product?: StoreProductLike | null): boolean {
  if (typeof product?.in_stock === "boolean") {
    return product.in_stock;
  }

  return getStoreProductStock(product) > 0;
}

export function getStoreProductRating(product?: StoreProductLike | null): number {
  return Number(product?.average_rating ?? product?.rating ?? 0);
}

export function getStoreProductReviews(product?: StoreProductLike | null): number {
  return Number(product?.review_count ?? product?.reviews_count ?? 0);
}
