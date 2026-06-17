"use client";

import { useEffect, useMemo, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { apiGet, apiPost, isApiError } from "@/lib/api";
import { mapGenericReviewToFeedItem } from "@/lib/review-feed";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { LikeButton } from "@/components/social/LikeButton";
import { CommentSection } from "@/components/social/CommentSection";
import { ReviewFeed } from "@/components/reviews/review-feed";
import { ReviewComposer } from "@/components/reviews/review-composer";
import {
  useCreateReview,
  useDeleteReview,
  useMarkReviewHelpful,
  useReviews,
  useUpdateReview,
} from "@/hooks/useReviews";
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
  product_type?: string | null;
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
  productType?: string | null;
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
    productType: product.product_type ?? null,
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
  const [showReviewComposer, setShowReviewComposer] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

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

  const { data: reviewsResponse, isLoading: isReviewsLoading } = useReviews(
    "product",
    product?.id ?? 0
  );
  const createReview = useCreateReview();
  const markReviewHelpful = useMarkReviewHelpful("product", product?.id ?? 0);
  const updateReview = useUpdateReview("product", product?.id ?? 0);
  const deleteReview = useDeleteReview("product", product?.id ?? 0);

  const { data: canReviewResponse } = useQuery({
    queryKey: ["store-product-can-review", product?.id],
    queryFn: () =>
      apiGet<{ data: { can_review: boolean; reason?: string; is_verified?: boolean } }>(
        `/reviews/product/${product?.id}/eligibility`
      ),
    enabled: status === "authenticated" && Boolean(product?.id),
  });

  useEffect(() => {
    if (product?.productType === "promotion") {
      router.replace(`/promotions/${product.slug}`);
    }
  }, [product, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
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

  if (product.productType === "promotion") {
    return (
      <div className="container mx-auto py-16 text-center">
        <Package className="mx-auto mb-4 h-14 w-14 text-primary" />
        <h1 className="text-2xl font-bold">Opening promotion listing</h1>
        <p className="mt-2 text-muted-foreground">
          This service belongs in the promotions marketplace, so we&apos;re taking you there.
        </p>
      </div>
    );
  }

  const reviews = reviewsResponse?.data.data ?? [];
  const reviewFeedItems = useMemo(
    () => reviews.map((review) => mapGenericReviewToFeedItem(review)),
    [reviews]
  );
  const editingReview = useMemo(
    () => reviews.find((review) => review.id === editingReviewId) ?? null,
    [editingReviewId, reviews]
  );

  const canReview = canReviewResponse?.data.can_review ?? false;
  const reviewBlockNote =
    status !== "authenticated"
      ? "Sign in after purchasing to leave a review."
      : canReviewResponse?.data.reason ?? "Share your experience with this product.";

  const handleCreateReview = ({
    rating,
    comment,
    wouldRecommend,
  }: {
    rating: number;
    comment: string;
    wouldRecommend: boolean;
  }) => {
    if (!product) return;

    createReview.mutate(
      {
        reviewable_type: "product",
        reviewable_id: product.id,
        rating,
        content: comment,
        is_verified_purchase: Boolean(canReviewResponse?.data.is_verified),
        metadata: { would_recommend: wouldRecommend, source: "store_product_page" },
      },
      {
        onSuccess: () => {
          setShowReviewComposer(false);
          setEditingReviewId(null);
          queryClient.invalidateQueries({ queryKey: ["product", slug] });
        },
      }
    );
  };

  const handleUpdateReview = ({
    rating,
    comment,
    wouldRecommend,
  }: {
    rating: number;
    comment: string;
    wouldRecommend: boolean;
  }) => {
    if (!editingReviewId) return;

    updateReview.mutate(
      {
        id: editingReviewId,
        data: {
          rating,
          content: comment,
          metadata: {
            ...(editingReview?.metadata ?? {}),
            would_recommend: wouldRecommend,
          },
        },
      },
      {
        onSuccess: () => {
          setEditingReviewId(null);
          queryClient.invalidateQueries({ queryKey: ["product", slug] });
        },
      }
    );
  };

  const handleMarkHelpful = (reviewId: number | string, helpful: boolean) => {
    if (typeof reviewId !== "number") return;
    markReviewHelpful.mutate({ id: reviewId, helpful });
  };

  const handleDeleteReview = (reviewId: number | string) => {
    if (typeof reviewId !== "number") return;
    deleteReview.mutate(reviewId, {
      onSuccess: () => {
        if (editingReviewId === reviewId) {
          setEditingReviewId(null);
        }
        queryClient.invalidateQueries({ queryKey: ["product", slug] });
      },
    });
  };

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
    <div className="container mx-auto py-8">
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

      <div className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <section className="space-y-5 rounded-[28px] border bg-card p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Product Reviews
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Buyer feedback for {product.name}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{reviewBlockNote}</p>
            </div>
            <div className="rounded-2xl border bg-background/70 px-4 py-3 text-right">
              <p className="text-2xl font-bold">{product.rating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(product.review_count)} review{product.review_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {status === "authenticated" && canReview && !showReviewComposer && !editingReview ? (
            <button
              onClick={() => setShowReviewComposer(true)}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Leave a review
            </button>
          ) : null}

          {showReviewComposer ? (
            <ReviewComposer
              title="Leave a product review"
              description="Tell future buyers what stood out about this item."
              submitLabel={createReview.isPending ? "Submitting..." : "Submit review"}
              disabled={createReview.isPending}
              onSubmit={handleCreateReview}
              onCancel={() => setShowReviewComposer(false)}
            />
          ) : null}

          {editingReview ? (
            <ReviewComposer
              key={`edit-${editingReview.id}`}
              title="Edit your review"
              description="Update your rating or review text."
              submitLabel={updateReview.isPending ? "Saving..." : "Save changes"}
              initialRating={editingReview.rating}
              initialComment={editingReview.content}
              initialWouldRecommend={Boolean(editingReview.metadata?.would_recommend)}
              disabled={updateReview.isPending}
              onSubmit={handleUpdateReview}
              onCancel={() => setEditingReviewId(null)}
            />
          ) : null}

          {isReviewsLoading ? (
            <div className="flex items-center gap-2 rounded-2xl border bg-background/70 p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading reviews...
            </div>
          ) : (
            <ReviewFeed
              reviews={reviewFeedItems}
              emptyMessage="No reviews yet. The first verified buyer review will appear here."
              onMarkHelpful={handleMarkHelpful}
              markingHelpfulId={markReviewHelpful.variables?.id ?? null}
              onEdit={(reviewId) => {
                if (typeof reviewId !== "number") return;
                setShowReviewComposer(false);
                setEditingReviewId(reviewId);
              }}
              onDelete={handleDeleteReview}
              deletingReviewId={deleteReview.variables ?? null}
            />
          )}
        </section>

        <section className="space-y-5 rounded-[28px] border bg-card p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Discussion
            </p>
            <h2 className="mt-2 text-2xl font-bold">Questions and comments</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use comments for general discussion. Reviews are for purchase-backed feedback.
            </p>
          </div>

          <CommentSection
            commentableType="product"
            commentableId={product.id}
            title="Comments"
          />
        </section>
      </div>
    </div>
  );
}
