"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  ShieldCheck,
  BadgeCheck,
  TrendingUp,
  CreditCard,
  Coins,
  Loader2,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { usePromotion, usePromotionReviews, usePurchasePromotion } from "@/hooks/usePromotions";
import {
  PROMOTION_TYPE_LABELS,
  PROMOTION_PLATFORM_LABELS,
} from "@/types/promotions";
import type { PaymentMethod } from "@/types/promotions";

type Tab = "overview" | "requirements" | "deliverables" | "reviews";

export default function PromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: promotion, isLoading, isError } = usePromotion(slug);
  const { data: reviewsData } = usePromotionReviews(slug);
  const purchase = usePurchasePromotion(slug);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credits");
  const [songId, setSongId] = useState("");
  const [notes, setNotes] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !promotion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Promotion Not Found</h2>
        <p className="text-muted-foreground mb-4">
          This promotion may have been removed or is no longer available.
        </p>
        <Link
          href="/promotions"
          className="text-primary underline text-sm"
        >
          Browse all promotions
        </Link>
      </div>
    );
  }

  const deliveryText =
    promotion.delivery_days_min === promotion.delivery_days_max
      ? `${promotion.delivery_days_min} day${promotion.delivery_days_min !== 1 ? "s" : ""}`
      : `${promotion.delivery_days_min}-${promotion.delivery_days_max} days`;

  const completionRate =
    promotion.total_orders > 0
      ? Math.round((promotion.completed_orders / promotion.total_orders) * 100)
      : 0;

  const handlePurchase = () => {
    purchase.mutate(
      {
        payment_method: paymentMethod,
        credits_amount: paymentMethod !== "ugx" ? promotion.price_credits : 0,
        ugx_amount: paymentMethod !== "credits" ? promotion.price_ugx : 0,
        song_id: songId ? Number(songId) : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: (data) => {
          router.push(`/promotions/purchases/${data.order_id}`);
        },
      }
    );
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "requirements", label: "Requirements" },
    { key: "deliverables", label: "Deliverables" },
    { key: "reviews", label: `Reviews (${promotion.rating_count})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Back */}
      <Link
        href="/promotions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Promotions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            {promotion.featured_image_url ? (
              <Image
                src={promotion.featured_image_url}
                alt={promotion.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <TrendingUp className="h-16 w-16 text-primary/30" />
              </div>
            )}
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{PROMOTION_TYPE_LABELS[promotion.type]}</span>
            <span>·</span>
            <span>{PROMOTION_PLATFORM_LABELS[promotion.platform]}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold">{promotion.title}</h1>

          {/* Promoter */}
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
              {promotion.promoter.avatar_url ? (
                <Image
                  src={promotion.promoter.avatar_url}
                  alt={promotion.promoter.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {promotion.promoter.name[0]}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/promoters/${promotion.promoter.username}`}
                  className="font-medium text-sm hover:text-primary transition-colors"
                >
                  {promotion.promoter.name}
                </Link>
                {promotion.promoter.is_verified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(promotion.promoter.follower_count)} followers
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 py-4 border-y">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <div>
                <span className="font-semibold">
                  {promotion.rating_average.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({promotion.rating_count} reviews)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-semibold">
                  {formatNumber(promotion.estimated_reach)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  reach
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-semibold">{deliveryText}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  delivery
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-semibold">{promotion.completed_orders}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  completed ({completionRate}%)
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeTab === tab.key
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="min-h-[200px]">
            {activeTab === "overview" && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{promotion.description}</p>
              </div>
            )}

            {activeTab === "requirements" && (
              <div className="space-y-3">
                {promotion.requirements ? (
                  <>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium text-sm">What You Need To Do</h4>
                      <p className="text-sm text-muted-foreground">
                        {promotion.requirements.action}
                      </p>
                      {promotion.requirements.duration_hours && (
                        <p className="text-xs text-muted-foreground">
                          Duration: {promotion.requirements.duration_hours} hours
                        </p>
                      )}
                      {promotion.requirements.hashtags?.length ? (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {promotion.requirements.hashtags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No specific requirements listed.
                  </p>
                )}
              </div>
            )}

            {activeTab === "deliverables" && (
              <div className="space-y-2">
                {promotion.deliverables?.length ? (
                  <ul className="space-y-2">
                    {promotion.deliverables.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No deliverables listed.
                  </p>
                )}

                {promotion.terms && (
                  <div className="mt-6 bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">Terms & Conditions</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {promotion.terms}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {reviewsData?.data?.length ? (
                  reviewsData.data.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {review.reviewer.name[0]}
                          </div>
                          <span className="text-sm font-medium">
                            {review.reviewer.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3.5 w-3.5",
                                i < review.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(review.created_at)}</span>
                        {review.would_recommend && (
                          <span className="text-emerald-600">
                            Would recommend
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4">
                    No reviews yet. Be the first to leave one after purchasing!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Pricing card */}
        <div className="space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-card border rounded-xl p-6 space-y-5">
              {/* Pricing */}
              <div className="space-y-1">
                {promotion.accepts_credits && (
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {formatNumber(promotion.price_credits)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      credits
                    </span>
                  </div>
                )}
                {promotion.accepts_ugx && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-semibold">
                      {formatCurrency(promotion.price_ugx)}
                    </span>
                  </div>
                )}
                {promotion.accepts_hybrid && (
                  <p className="text-xs text-muted-foreground">
                    Hybrid payment accepted (credits + UGX)
                  </p>
                )}
              </div>

              {/* Purchase button */}
              {!showCheckout ? (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Purchase Promotion
                </button>
              ) : (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-sm">Complete Purchase</h4>

                  {/* Payment method */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {promotion.accepts_credits && (
                        <button
                          onClick={() => setPaymentMethod("credits")}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border text-sm text-left transition-colors",
                            paymentMethod === "credits"
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground/30"
                          )}
                        >
                          <Coins className="h-4 w-4 text-primary" />
                          Credits Only
                        </button>
                      )}
                      {promotion.accepts_ugx && (
                        <button
                          onClick={() => setPaymentMethod("ugx")}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border text-sm text-left transition-colors",
                            paymentMethod === "ugx"
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground/30"
                          )}
                        >
                          <CreditCard className="h-4 w-4" />
                          UGX (Mobile Money)
                        </button>
                      )}
                      {promotion.accepts_hybrid && (
                        <button
                          onClick={() => setPaymentMethod("hybrid")}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border text-sm text-left transition-colors",
                            paymentMethod === "hybrid"
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground/30"
                          )}
                        >
                          <Coins className="h-4 w-4 text-primary" />
                          Hybrid (Credits + UGX)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Song ID */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Song ID (optional)
                    </label>
                    <input
                      type="text"
                      value={songId}
                      onChange={(e) => setSongId(e.target.value)}
                      placeholder="Enter your song ID"
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Notes for Promoter
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions..."
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  {/* Confirm */}
                  <button
                    onClick={handlePurchase}
                    disabled={purchase.isPending}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {purchase.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Confirm Purchase
                  </button>

                  <button
                    onClick={() => setShowCheckout(false)}
                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Trust signals */}
              <div className="flex flex-col gap-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Payment held in escrow until verified
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  Dispute resolution available
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Auto-verify after 7 days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
