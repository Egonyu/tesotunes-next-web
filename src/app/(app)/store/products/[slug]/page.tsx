"use client";

import { useState } from "react";
import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  ShoppingCart,
  Share2,
  Star,
  Truck,
  Shield,
  Package,
  Minus,
  Plus,
  Check,
  Images,
} from "lucide-react";
import { apiGet, apiPost, isApiError } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { LikeButton } from "@/components/social/LikeButton";
import { CommentSection } from "@/components/social/CommentSection";
import { toast } from "sonner";

interface ProductRecord {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string | null;
  price_ugx?: number | string | null;
  price_credits?: number | null;
  featured_image?: string | null;
  featured_image_url?: string | null;
  image_urls?: string[];
  category?: { name: string; slug?: string | null };
  store: { name: string; slug: string };
  inventory_quantity?: number | null;
  average_rating?: number | string | null;
  review_count?: number | null;
  metadata?: Record<string, string> | null;
  allow_hybrid_payment?: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  summary: string;
  price: number;
  priceCredits: number;
  allowHybridPayment: boolean;
  images: { url: string; alt: string }[];
  category: { name: string; slug?: string };
  store: { name: string; slug: string };
  stock_quantity: number;
  rating: number;
  review_count: number;
  specifications?: Record<string, string>;
}

function normalizeProduct(product: ProductRecord): Product {
  const imageUrls = [
    product.featured_image_url || product.featured_image || "",
    ...(product.image_urls ?? []),
  ].filter((value, index, array) => value && array.indexOf(value) === index);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || product.short_description || "",
    summary: product.short_description || product.description || "",
    price: Number(product.price_ugx ?? 0),
    priceCredits: Number(product.price_credits ?? 0),
    allowHybridPayment: !!product.allow_hybrid_payment,
    images: imageUrls.map((url, index) => ({
      url,
      alt: index === 0 ? product.name : `${product.name} image ${index + 1}`,
    })),
    category: {
      name: product.category?.name ?? "Uncategorized",
      slug: product.category?.slug ?? undefined,
    },
    store: product.store,
    stock_quantity: Number(product.inventory_quantity ?? 0),
    rating: Number(product.average_rating ?? 0),
    review_count: Number(product.review_count ?? 0),
    specifications: product.metadata ?? undefined,
  };
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await apiGet<{ data: ProductRecord }>(`/store/public/products/${slug}`);
      return normalizeProduct(response.data);
    },
  });

  const addToCart = useMutation({
    mutationFn: () =>
      apiPost("/store/cart/items", { product_id: product?.id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setAddedToCart(true);
      toast.success(`${product?.name ?? "Product"} added to cart.`);
      setTimeout(() => setAddedToCart(false), 3000);
    },
    onError: (error) => {
      if (isApiError(error) && error.response?.status === 401) {
        toast.error("Sign in to add store items to your cart.");
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      const message = isApiError(error)
        ? error.response?.data?.message || "Could not add this item to your cart."
        : "Could not add this item to your cart.";
      toast.error(message);
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

  const handleAddToCart = () => {
    if (addedToCart) {
      router.push("/store/cart");
      return;
    }

    if (status === "loading") {
      return;
    }

    if (status !== "authenticated") {
      toast.error("Sign in to add store items to your cart.");
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    addToCart.mutate();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/store" className="hover:text-foreground">
          Store
        </Link>
        <span>/</span>
        <Link href="/store" className="hover:text-foreground">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="rounded-3xl border bg-card p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-[92px_minmax(0,1fr)]">
              {product.images.length > 1 ? (
                <div className="order-2 flex gap-3 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-muted transition-colors ${
                        i === selectedImage ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="order-1 relative aspect-square overflow-hidden rounded-[28px] bg-linear-to-br from-primary/10 via-background to-primary/5 md:order-2">
                {product.images[selectedImage] ? (
                  <Image
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt || product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Package className="h-24 w-24" />
                    <span className="text-sm font-medium">Product gallery coming soon</span>
                  </div>
                )}
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white">
                  <Images className="h-3.5 w-3.5" />
                  {Math.max(product.images.length, 1)} image{Math.max(product.images.length, 1) !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {product.category.name}
              </span>
              <Link
                href={`/store/shops/${product.store.slug}`}
                className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Sold by {product.store.name}
              </Link>
            </div>
            <h1 className="mt-3 text-3xl font-bold lg:text-4xl">{product.name}</h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              {product.summary}
            </p>

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
          <div className="rounded-3xl border bg-card p-5">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              {product.priceCredits > 0 ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                  or {formatNumber(product.priceCredits)} credits
                </span>
              ) : null}
              {product.allowHybridPayment ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900">
                  UGX + credits accepted
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Pay in UGX today, with credits and hybrid payment available on selected Store drops.
            </p>
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
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || addToCart.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {addedToCart ? (
                <>
                  <Check className="h-5 w-5" />
                  View Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>

            <LikeButton
              likeableType="product"
              likeableId={product.id}
              variant="icon"
              showCount={false}
            />

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
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border bg-card px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {key}
                    </p>
                    <p className="mt-1 font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews / Comments Section */}
      <div className="mt-12">
        <CommentSection
          commentableType="product"
          commentableId={product.id}
          title={`Reviews & Comments`}
        />
      </div>
    </div>
  );
}
