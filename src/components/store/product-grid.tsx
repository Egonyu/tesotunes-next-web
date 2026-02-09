"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Star, Loader2 } from "lucide-react";
import { useStoreProducts, Product } from "@/hooks/useStoreProducts";

interface StoreProductGridProps {
  searchQuery: string;
  category: string;
}

function ProductCard({ product }: { product: Product }) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="group rounded-xl bg-card border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-square relative bg-linear-to-br from-primary/10 to-primary/5">
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          🎵
        </div>
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
        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
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
          <span className="text-lg font-bold">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          disabled={!product.inStock}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
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
