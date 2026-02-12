"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2, ShoppingCart, Package, Star } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface WishlistItem {
  id: number;
  product: {
    id: number;
    title: string;
    slug: string;
    price: number;
    original_price?: number;
    image_url: string | null;
    rating: number;
    reviews_count: number;
    in_stock: boolean;
    stock_quantity: number;
  };
  added_at: string;
}

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => apiGet<WishlistItem[]>("/api/store/wishlist"),
  });

  const removeFromWishlist = useMutation({
    mutationFn: (itemId: number) => apiDelete(`/api/store/wishlist/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
    onError: () => toast.error("Failed to remove item"),
  });

  const addToCart = useMutation({
    mutationFn: (productId: number) =>
      apiPost("/api/store/cart/items", { product_id: productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const moveAllToCart = useMutation({
    mutationFn: () => apiPost("/api/store/wishlist/move-to-cart", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", "cart"] });
      toast.success("All items moved to cart");
    },
    onError: () => toast.error("Failed to move items"),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlist?.length || 0} saved items
          </p>
        </div>
        {wishlist && wishlist.length > 0 && (
          <button
            onClick={() => moveAllToCart.mutate()}
            disabled={moveAllToCart.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            Add All to Cart
          </button>
        )}
      </div>

      {!wishlist?.length ? (
        <div className="text-center py-16 bg-card rounded-lg border">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Save items you love for later
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-lg border overflow-hidden group"
            >
              <div className="relative aspect-square bg-muted">
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Package className="absolute inset-0 m-auto h-16 w-16 text-muted-foreground" />
                )}

                {/* Discount Badge */}
                {item.product.original_price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {Math.round(
                      ((item.product.original_price - item.product.price) /
                        item.product.original_price) *
                        100
                    )}
                    % OFF
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist.mutate(item.id)}
                  disabled={removeFromWishlist.isPending}
                  className="absolute top-2 right-2 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>

                {/* Quick Add */}
                {item.product.in_stock && (
                  <button
                    onClick={() => addToCart.mutate(item.product.id)}
                    disabled={addToCart.isPending}
                    className="absolute bottom-2 left-2 right-2 py-2 bg-primary text-primary-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                )}
              </div>

              <div className="p-4">
                <Link
                  href={`/store/products/${item.product.slug}`}
                  className="font-medium line-clamp-2 hover:text-primary"
                >
                  {item.product.title}
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-medium">{item.product.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({item.product.reviews_count})
                  </span>
                </div>

                {/* Price */}
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold">
                    {formatCurrency(item.product.price)}
                  </span>
                  {item.product.original_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(item.product.original_price)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                {!item.product.in_stock && (
                  <p className="text-sm text-red-500 mt-2">Out of Stock</p>
                )}
                {item.product.in_stock && item.product.stock_quantity <= 5 && (
                  <p className="text-sm text-yellow-500 mt-2">
                    Only {item.product.stock_quantity} left!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
