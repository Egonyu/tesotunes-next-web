"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Star, Loader2, Package, Images } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStoreProducts, Product } from "@/hooks/useStoreProducts";
import { apiPost, isApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface StoreProductGridProps {
  searchQuery: string;
  category: string;
}

function ProductCard({ product }: { product: Product }) {
  const [isLiked, setIsLiked] = useState(false);
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const addToCart = useMutation({
    mutationFn: () => apiPost("/store/cart/items", { product_id: product.id, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${product.name} added to cart.`);
    },
    onError: (error) => {
      if (isApiError(error) && error.response?.status === 401) {
        toast.error("Sign in to add store items to your cart.");
        const callbackUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }

      const message = isApiError(error)
        ? error.response?.data?.message || "Could not add this item to your cart."
        : "Could not add this item to your cart.";
      toast.error(message);
    },
  });

  const handleAddToCart = () => {
    if (status === "loading") {
      return;
    }

    if (status !== "authenticated") {
      toast.error("Sign in to add store items to your cart.");
      const callbackUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    addToCart.mutate();
  };

  return (
    <div className="group rounded-xl bg-card border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-square relative bg-linear-to-br from-primary/10 to-primary/5">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Package className="h-14 w-14" />
            <span className="text-sm font-medium">Store preview loading</span>
          </div>
        )}
        {product.image_urls && product.image_urls.length > 1 ? (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">
            <Images className="h-3.5 w-3.5" />
            {product.image_urls.length} views
          </div>
        ) : null}
        {product.originalPrice && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
            {Math.round(
              ((product.originalPrice - product.price) / product.originalPrice) *
                100
            )}
            % OFF
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-white/20 text-white font-medium">
              Out of Stock
            </span>
          </div>
        )}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <Heart
            className={`h-4 w-4 ${
              isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              {product.category}
            </p>
            <Link href={`/store/products/${product.slug}`} className="font-semibold line-clamp-1 hover:text-primary">
              {product.name}
            </Link>
            {product.store?.name ? (
              <p className="mt-1 text-xs text-muted-foreground">{product.store.name}</p>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {addToCart.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function StoreProductGrid({
  searchQuery,
  category,
}: StoreProductGridProps) {
  const { data: products = [], isLoading } = useStoreProducts({
    searchQuery,
    category,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
