"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, ShoppingCart, ReceiptText, ArrowRight } from "lucide-react";
import { StoreProductGrid } from "@/components/store/product-grid";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useStoreEnabled } from "@/hooks/usePlatformSettings";
import { useSession } from "next-auth/react";

interface StoreCategory {
  id: number;
  name: string;
  slug: string;
}

const defaultCategories = [
  { id: "all", name: "All Products" },
  { id: "merchandise", name: "Merchandise" },
  { id: "music", name: "Music" },
  { id: "tickets", name: "Tickets" },
  { id: "equipment", name: "Equipment" },
];

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { status } = useSession();
  const storeEnabled = useStoreEnabled();

  const { data: apiCategories } = useQuery({
    queryKey: ["store-categories"],
    queryFn: async () => {
      try {
        const res = await apiGet<{ data: StoreCategory[] }>("/store/public/categories");
        return [
          { id: "all", name: "All Products" },
          ...res.data.map((c) => ({ id: String(c.id), name: c.name })),
        ];
      } catch {
        return defaultCategories;
      }
    },
    enabled: storeEnabled,
    staleTime: 10 * 60 * 1000,
  });

  const { data: cartSummary } = useQuery({
    queryKey: ["cart-summary"],
    queryFn: () =>
      apiGet<{ data?: { items_count?: number } }>("/store/cart").then((response) => response.data),
    enabled: storeEnabled && status === "authenticated",
    retry: false,
  });

  const categories = apiCategories ?? defaultCategories;
  const cartCount = cartSummary?.items_count ?? 0;

  if (!storeEnabled) {
    return (
      <div className="container mx-auto py-16 text-center">
        <ShoppingBag className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-2">Store Coming Soon</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Artist store management lives in Artist Studio, and the public storefront will appear here once the
          consumer catalog contract is enabled.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Store</h1>
            <p className="text-muted-foreground">
              Shop for merchandise, music, and more
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {status === "authenticated" ? (
            <>
              <Link
                href="/store/cart"
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                <ShoppingCart className="h-4 w-4" />
                View Cart
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              </Link>
              <Link
                href="/store/orders"
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                <ReceiptText className="h-4 w-4" />
                My Orders
              </Link>
            </>
          ) : (
            <Link
              href="/login?callbackUrl=%2Fstore"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign in for cart
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <StoreProductGrid
        searchQuery={searchQuery}
        category={selectedCategory}
      />
    </div>
  );
}
