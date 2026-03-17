"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from "lucide-react";
import { apiGet, apiPut, apiDelete, isApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  getStoreProductImage,
  getStoreProductName,
  getStoreProductPrice,
  getStoreProductStock,
} from "@/lib/store-product-utils";
import { toast } from "sonner";

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    title?: string;
    name?: string;
    slug: string;
    price?: number;
    price_ugx?: number;
    image_url: string | null;
    featured_image_url?: string | null;
    stock_quantity?: number;
    inventory_quantity?: number;
  };
  price?: number;
  price_ugx?: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface CartApiResponse {
  data?: {
    items?: CartItem[];
    total?: number;
    total_ugx?: number;
    items_count?: number;
  };
}

function normalizeCartResponse(response: Cart | CartApiResponse): Cart {
  if ("items" in response && Array.isArray(response.items)) {
    return response;
  }

  const payload = "data" in response ? response.data : undefined;
  const items = payload?.items ?? [];
  const total = Number(payload?.total_ugx ?? payload?.total ?? 0);

  return {
    items,
    subtotal: total,
    shipping: 0,
    tax: 0,
    total,
  };
}

export default function CartPage() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { status } = useSession();

  const { data: cart, isLoading, error, isError } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => normalizeCartResponse(await apiGet<Cart | CartApiResponse>("/store/cart")),
    retry: false,
  });

  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      apiPut(`/store/cart/items/${itemId}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: (mutationError) => {
      const message = isApiError(mutationError)
        ? mutationError.response?.data?.message || "Could not update cart quantity."
        : "Could not update cart quantity.";
      toast.error(message);
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: number) => apiDelete(`/store/cart/items/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: (mutationError) => {
      const message = isApiError(mutationError)
        ? mutationError.response?.data?.message || "Could not remove this item."
        : "Could not remove this item.";
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    const isUnauthenticated =
      status === "unauthenticated" ||
      (isApiError(error) && error.response?.status === 401);

    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">
          {isUnauthenticated ? "Sign in to view your cart" : "Cart unavailable right now"}
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          {isUnauthenticated
            ? "Store carts are tied to your account, so you need to sign in before you can review or check out your items."
            : "We couldn't load your cart just now. Please refresh and try again."}
        </p>
        <div className="flex justify-center gap-3">
          {isUnauthenticated ? (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
          <Link
            href="/store"
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 hover:bg-muted"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        {!isEmpty && (
          <span className="ml-auto text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Browse our store and add items to your cart
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-card rounded-lg border"
              >
                <div className="relative w-24 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                  {getStoreProductImage(item.product) ? (
                    <Image
                      src={getStoreProductImage(item.product) || ""}
                      alt={getStoreProductName(item.product)}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Package className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/store/products/${item.product.slug}`}
                    className="font-medium hover:text-primary line-clamp-2"
                  >
                    {getStoreProductName(item.product)}
                  </Link>
                  <p className="text-primary font-medium mt-1">
                    {formatCurrency(getStoreProductPrice(item.product))}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity.mutate({
                            itemId: item.id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-muted disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity.mutate({
                            itemId: item.id,
                            quantity: item.quantity + 1,
                          })
                        }
                        disabled={item.quantity >= getStoreProductStock(item.product)}
                        className="p-2 hover:bg-muted disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem.mutate(item.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    {formatCurrency((item.price_ugx ?? item.price ?? getStoreProductPrice(item.product)) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(cart?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {cart?.shipping === 0
                      ? "Free"
                      : formatCurrency(cart?.shipping || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(cart?.tax || 0)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatCurrency(cart?.total || 0)}
                  </span>
                </div>
              </div>

              <Link
                href="/store/checkout"
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/store"
                className="w-full mt-3 flex items-center justify-center gap-2 px-6 py-3 border rounded-lg hover:bg-muted"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
