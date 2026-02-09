"use client";

import { useState } from "react";
import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  Package,
  Minus,
  Plus,
  ChevronLeft,
  Check,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: { url: string; alt: string }[];
  category: { name: string; slug: string };
  store: { name: string; slug: string };
  stock_quantity: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  specifications?: Record<string, string>;
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => apiGet<Product>(`/store/products/${slug}`),
  });

  const addToCart = useMutation({
    mutationFn: () =>
      apiPost("/store/cart/items", { product_id: product?.id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    },
  });

  const addToWishlist = useMutation({
    mutationFn: () => apiPost("/store/wishlist", { product_id: product?.id }),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-6 w-1/4 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
        <Link href="/store" className="text-primary hover:underline">
          Back to Store
        </Link>
      </div>
    );
  }

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/store" className="hover:text-foreground">
          Store
        </Link>
        <span>/</span>
        <Link href={`/store/categories/${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt || product.title}
                fill
                className="object-cover"
              />
            ) : (
              <Package className="absolute inset-0 m-auto h-24 w-24 text-muted-foreground" />
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded">
                -{discount}%
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 ${
                    i === selectedImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <Link
              href={`/store/shops/${product.store.slug}`}
              className="text-sm text-primary hover:underline"
            >
              {product.store.name}
            </Link>
            <h1 className="text-3xl font-bold mt-1">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= product.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({formatNumber(product.review_count)} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-xl text-muted-foreground line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stock_quantity > 0 ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-600">In Stock</span>
                <span className="text-muted-foreground">
                  ({product.stock_quantity} available)
                </span>
              </>
            ) : (
              <span className="text-red-500">Out of Stock</span>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="p-3 hover:bg-muted disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-6 py-3 min-w-[4rem] text-center font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                disabled={quantity >= product.stock_quantity}
                className="p-3 hover:bg-muted disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => addToCart.mutate()}
              disabled={product.stock_quantity === 0 || addToCart.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {addedToCart ? (
                <>
                  <Check className="h-5 w-5" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={() => addToWishlist.mutate()}
              className="p-3 border rounded-lg hover:bg-muted"
            >
              <Heart className="h-5 w-5" />
            </button>

            <button className="p-3 border rounded-lg hover:bg-muted">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
            <div className="text-center">
              <Truck className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-muted-foreground">On orders over UGX 100k</p>
            </div>
            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-sm font-medium">Secure Payment</p>
              <p className="text-xs text-muted-foreground">100% secure checkout</p>
            </div>
            <div className="text-center">
              <Package className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-muted-foreground">7-day return policy</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-bold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h2 className="font-bold mb-2">Specifications</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
