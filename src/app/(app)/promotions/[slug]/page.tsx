"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  Clock,
  Coins,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { usePromotion, usePurchasePromotion } from "@/hooks/usePromotions";
import { apiPost } from "@/lib/api";
import { getPromotionProofGuide } from "@/lib/promotions-proof";
import { ReviewFeed } from "@/components/reviews/review-feed";
import { useMarkReviewHelpful, useReviews } from "@/hooks/useReviews";
import { mapGenericReviewToFeedItem, mapPromotionReviewToFeedItem } from "@/lib/review-feed";
import {
  PROMOTION_AUDIENCE_NICHE_LABELS,
  PROMOTION_CONTENT_FORMAT_LABELS,
  PROMOTION_PLATFORM_LABELS,
  PROMOTION_TYPE_LABELS,
} from "@/types/promotions";
import type { PaymentMethod } from "@/types/promotions";
import { toast } from "sonner";

type Tab = "overview" | "fit" | "deliverables" | "reviews";

function nice(value: string | null | undefined) {
  if (!value) return "Other";
  return value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border bg-card px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

export default function PromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { data: promotion, isLoading, isError } = usePromotion(slug);
  const purchase = usePurchasePromotion(slug);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credits");
  const [songId, setSongId] = useState("");
  const [notes, setNotes] = useState("");

  const selectedEvent =
    searchParams.get("target_type") === "event" && searchParams.get("event_id") && searchParams.get("event_name")
      ? {
          id: Number(searchParams.get("event_id")),
          title: searchParams.get("event_name") as string,
          slug: searchParams.get("event_slug"),
          startsAt: searchParams.get("event_starts_at"),
          venue: searchParams.get("event_venue"),
          city: searchParams.get("event_city"),
        }
      : null;

  const submitEventPromotionRequest = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiPost<{ success: boolean; message: string }>(`/artist/events/${selectedEvent?.id}/promotion-requests`, payload),
  });

  const backHref = selectedEvent
    ? `/promotions/browse?target_type=event&event_id=${selectedEvent.id}&event_name=${encodeURIComponent(selectedEvent.title)}`
    : "/promotions";

  const { data: genericReviewsResponse } = useReviews("product", promotion?.id ?? 0);
  const markReviewHelpful = useMarkReviewHelpful("product", promotion?.id ?? 0);

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (isError || !promotion) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Promotion Not Found</h2>
        <p className="mt-2 text-muted-foreground">This promotion may have been removed or is no longer available.</p>
        <Link href="/promotions" className="mt-4 inline-block text-sm text-primary underline">Browse all promotions</Link>
      </div>
    );
  }

  const typeLabel = PROMOTION_TYPE_LABELS[promotion.type] ?? nice(promotion.type);
  const platformLabel = PROMOTION_PLATFORM_LABELS[promotion.platform] ?? nice(promotion.platform);
  const deliveryText =
    promotion.delivery_days_min === promotion.delivery_days_max
      ? `${promotion.delivery_days_min} day${promotion.delivery_days_min !== 1 ? "s" : ""}`
      : `${promotion.delivery_days_min}-${promotion.delivery_days_max} days`;
  const completionRate = promotion.total_orders > 0 ? Math.round((promotion.completed_orders / promotion.total_orders) * 100) : 0;
  const genericReviews = genericReviewsResponse?.data.data ?? [];
  const reviewFeedItems = genericReviews.length
    ? genericReviews.map((review) => mapGenericReviewToFeedItem(review))
    : (promotion.reviews ?? []).map((review) => mapPromotionReviewToFeedItem(review));
  const proofGuide = getPromotionProofGuide(promotion.platform, promotion.type);
  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "fit", label: "Audience Fit" },
    { key: "deliverables", label: "Deliverables" },
    { key: "reviews", label: `Reviews (${promotion.rating_count})` },
  ];

  const paymentLabels =
    [
      promotion.accepts_credits ? "Credits" : null,
      promotion.accepts_ugx ? "UGX" : null,
      promotion.accepts_hybrid ? "Hybrid" : null,
    ]
      .filter(Boolean)
      .join(", ") || "Flexible";

  const handlePurchase = () => {
    if (selectedEvent) {
      submitEventPromotionRequest.mutate(
        {
          promotion_slug: promotion.slug,
          promotion_title: promotion.title,
          promotion_type: promotion.type,
          promotion_platform: promotion.platform,
          price_credits: promotion.price_credits,
          price_ugx: promotion.price_ugx,
          request_notes: notes || undefined,
          featured_image_url: promotion.featured_image_url,
          payload: { target_type: "event", event_id: selectedEvent.id, payment_method: paymentMethod, song_id: songId ? Number(songId) : undefined },
        },
        {
          onSuccess: (response) => {
            toast.success(response.message || "Promotion request submitted");
            router.push(`/artist/events/${selectedEvent.id}`);
          },
          onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Failed to submit promotion request"),
        }
      );
      return;
    }

    purchase.mutate(
      {
        payment_method: paymentMethod,
        credits_amount: paymentMethod !== "ugx" ? promotion.price_credits : 0,
        ugx_amount: paymentMethod !== "credits" ? promotion.price_ugx : 0,
        song_id: songId ? Number(songId) : undefined,
        notes: notes || undefined,
      },
      { onSuccess: (data) => router.push(`/promotions/purchases/${data.order_id}`) }
    );
  };

  const handleMarkHelpful = (reviewId: number | string, helpful: boolean) => {
    if (typeof reviewId !== "number") return;
    markReviewHelpful.mutate({ id: reviewId, helpful });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {selectedEvent ? "Back to Event Promotions" : "Back to Promotions"}
        </Link>

        <section className="overflow-hidden rounded-[28px] border bg-card">
          <div className="grid xl:grid-cols-[minmax(0,1.35fr)_380px]">
            <div className="relative min-h-[320px] border-b xl:border-b-0 xl:border-r">
              {promotion.featured_image_url ? (
                <Image src={promotion.featured_image_url} alt={promotion.title} fill priority className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/5" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute left-0 right-0 top-0 flex flex-wrap gap-2 p-6">
                <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{typeLabel}</span>
                <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">{platformLabel}</span>
                {promotion.is_featured && <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">Featured</span>}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">{promotion.title}</h1>
                <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">{promotion.short_description}</p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/85">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5"><Users className="h-4 w-4" />{formatNumber(promotion.estimated_reach)} reach</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5"><Clock className="h-4 w-4" />{deliveryText}</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5"><Star className="h-4 w-4 text-amber-300" />{promotion.rating_average.toFixed(1)} rating</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="rounded-[24px] border bg-background/70 p-5">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
                    {promotion.promoter.avatar_url ? (
                      <Image src={promotion.promoter.avatar_url} alt={promotion.promoter.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 font-bold text-primary">{promotion.promoter.name[0]}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/promoters/${promotion.promoter.username}`} className="truncate font-semibold hover:text-primary">{promotion.promoter.name}</Link>
                      {promotion.promoter.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">@{promotion.promoter.username} · {formatNumber(promotion.promoter.follower_count)} followers</p>
                  </div>
                </div>

                {selectedEvent && (
                  <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Event Context</p>
                    <h2 className="mt-2 font-semibold">{selectedEvent.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedEvent.venue || "Venue pending"}{selectedEvent.city ? ` · ${selectedEvent.city}` : ""}{selectedEvent.startsAt ? ` · ${selectedEvent.startsAt}` : ""}</p>
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Stat label="Completed Orders" value={formatNumber(promotion.completed_orders)} note={`${completionRate}% completion rate`} />
                  <Stat label="Payment Modes" value={paymentLabels} note="Supported checkout methods" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_380px]">
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-4">
              <Stat label="Audience" value={formatNumber(promotion.estimated_reach)} note="Estimated reach" />
              <Stat label="Delivery" value={deliveryText} note="Typical turnaround" />
              <Stat label="Reviews" value={formatNumber(promotion.rating_count)} note={`${promotion.rating_average.toFixed(1)} avg rating`} />
              <Stat label="Orders" value={formatNumber(promotion.total_orders)} note={`${formatNumber(promotion.completed_orders)} completed`} />
            </section>

            <section className="rounded-[24px] border bg-card p-5">
              <div className="border-b">
                <div className="flex gap-6 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn("border-b-2 pb-3 text-sm font-medium -mb-px whitespace-nowrap", activeTab === tab.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-[260px] pt-5">
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-semibold">About this service</h2>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{promotion.description}</p>
                    </div>
                    {promotion.terms && (
                      <div className="rounded-2xl border bg-background/70 p-4">
                        <h3 className="text-sm font-semibold">Terms and expectations</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{promotion.terms}</p>
                      </div>
                    )}
                    {promotion.platform_specifics &&
                      Object.values(promotion.platform_specifics).some(Boolean) && (
                        <div className="rounded-2xl border bg-background/70 p-4">
                          <h3 className="text-sm font-semibold">
                            Channel-specific service details
                          </h3>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            {promotion.platform_specifics.channel ? (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                  Channel
                                </p>
                                <p className="mt-1 text-sm text-foreground">
                                  {promotion.platform_specifics.channel}
                                </p>
                              </div>
                            ) : null}
                            {promotion.platform_specifics.placement ? (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                  Placement
                                </p>
                                <p className="mt-1 text-sm text-foreground">
                                  {promotion.platform_specifics.placement}
                                </p>
                              </div>
                            ) : null}
                            {promotion.platform_specifics.timing ? (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                  Timing
                                </p>
                                <p className="mt-1 text-sm text-foreground">
                                  {promotion.platform_specifics.timing}
                                </p>
                              </div>
                            ) : null}
                            {promotion.platform_specifics.proof ? (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                  Proof expectation
                                </p>
                                <p className="mt-1 text-sm text-foreground">
                                  {promotion.platform_specifics.proof}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {activeTab === "fit" && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border bg-background/70 p-4">
                      <div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Audience Niches</h3></div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(promotion.audience_niches ?? []).length > 0 ? (
                          promotion.audience_niches?.map((niche) => (
                            <span key={niche} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{PROMOTION_AUDIENCE_NICHE_LABELS[niche] ?? nice(niche)}</span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No niche targeting listed.</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-2xl border bg-background/70 p-4">
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Audience Regions</h3></div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(promotion.audience_regions ?? []).length > 0 ? (
                          promotion.audience_regions?.map((region) => (
                            <span key={region} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{region}</span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No regional targeting listed.</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-2xl border bg-background/70 p-4">
                      <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Formats</h3></div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(promotion.content_formats ?? []).length > 0 ? (
                          promotion.content_formats?.map((format) => (
                            <span key={format} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{PROMOTION_CONTENT_FORMAT_LABELS[format] ?? nice(format)}</span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No format preference listed.</span>
                        )}
                      </div>
                    </div>
                    {promotion.requirements && (
                      <div className="rounded-2xl border bg-background/70 p-4 md:col-span-3">
                        <h3 className="text-sm font-semibold">Requirements from the promoter</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{promotion.requirements.action}</p>
                        {promotion.requirements.duration_hours && <p className="mt-2 text-xs text-muted-foreground">Duration expectation: {promotion.requirements.duration_hours} hours</p>}
                        {promotion.requirements.hashtags?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {promotion.requirements.hashtags.map((tag) => (
                              <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{tag}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "deliverables" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border bg-background/70 p-4">
                      <h2 className="text-lg font-semibold">What the artist receives</h2>
                      {promotion.deliverables?.length ? (
                        <ul className="mt-4 space-y-3">
                          {promotion.deliverables.map((item, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm">
                              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">No structured deliverables are listed yet.</p>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border bg-background/70 p-4">
                        <h3 className="text-sm font-semibold">{proofGuide.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {proofGuide.buyerPrompt}
                        </p>
                        <div className="mt-4 space-y-2">
                          {proofGuide.proofExamples.map((item) => (
                            <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border bg-background/70 p-4">
                        <h3 className="text-sm font-semibold">Verification checklist</h3>
                        <div className="mt-4 space-y-2">
                          {proofGuide.checklist.map((item) => (
                            <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <ReviewFeed
                    reviews={reviewFeedItems}
                    emptyMessage="No reviews yet. The first buyer review will appear here after a completed order."
                    onMarkHelpful={genericReviews.length ? handleMarkHelpful : undefined}
                    markingHelpfulId={markReviewHelpful.variables?.id ?? null}
                  />
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <section className="rounded-[24px] border bg-card p-6">
                <div className="space-y-1">
                  {promotion.accepts_credits && <div className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary" /><span className="text-2xl font-bold text-primary">{formatNumber(promotion.price_credits)}</span><span className="text-sm text-muted-foreground">credits</span></div>}
                  {promotion.accepts_ugx && <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-muted-foreground" /><span className="text-lg font-semibold">{formatCurrency(promotion.price_ugx)}</span></div>}
                  {promotion.accepts_hybrid && <p className="text-xs text-muted-foreground">Hybrid payment accepted: credits + UGX</p>}
                </div>

                {!showCheckout ? (
                  <button onClick={() => setShowCheckout(true)} className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    {selectedEvent ? "Request Event Promotion Review" : "Purchase Promotion"}
                  </button>
                ) : (
                  <div className="mt-5 border-t pt-5">
                    {!selectedEvent && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
                        <div className="grid gap-2">
                          {promotion.accepts_credits && <button onClick={() => setPaymentMethod("credits")} className={cn("rounded-xl border p-3 text-left text-sm", paymentMethod === "credits" ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30")}><Coins className="mr-2 inline h-4 w-4 text-primary" />Credits only</button>}
                          {promotion.accepts_ugx && <button onClick={() => setPaymentMethod("ugx")} className={cn("rounded-xl border p-3 text-left text-sm", paymentMethod === "ugx" ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30")}><CreditCard className="mr-2 inline h-4 w-4" />UGX</button>}
                          {promotion.accepts_hybrid && <button onClick={() => setPaymentMethod("hybrid")} className={cn("rounded-xl border p-3 text-left text-sm", paymentMethod === "hybrid" ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30")}><Coins className="mr-2 inline h-4 w-4 text-primary" />Hybrid</button>}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">{selectedEvent ? "Song ID (optional support track)" : "Song ID (optional)"}</label>
                      <input type="text" value={songId} onChange={(event) => setSongId(event.target.value)} placeholder="Enter your song ID" className="w-full rounded-xl border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div className="mt-4 space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Notes for promoter</label>
                      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add campaign notes or instructions..." rows={4} className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm" />
                    </div>

                    <button onClick={handlePurchase} disabled={purchase.isPending || submitEventPromotionRequest.isPending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                      {(purchase.isPending || submitEventPromotionRequest.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                      {selectedEvent ? "Submit for review" : "Confirm purchase"}
                    </button>
                    <button onClick={() => setShowCheckout(false)} className="mt-2 w-full py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                )}
              </section>

              <section className="rounded-[24px] border bg-card p-5">
                <h2 className="text-lg font-semibold">Trust and delivery</h2>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" /><div><p className="text-sm font-medium">Escrow protection</p><p className="text-sm text-muted-foreground">Payment is held until delivery is verified or a dispute is resolved.</p></div></div>
                  <div className="flex items-start gap-3"><MessageSquare className="mt-0.5 h-4 w-4 text-blue-500" /><div><p className="text-sm font-medium">Review-backed storefronts</p><p className="text-sm text-muted-foreground">Completed orders can be reviewed by buyers.</p></div></div>
                  <div className="flex items-start gap-3"><Clock className="mt-0.5 h-4 w-4 text-amber-500" /><div><p className="text-sm font-medium">Verification flow</p><p className="text-sm text-muted-foreground">Proof is submitted after execution and can be disputed if expectations are not met.</p></div></div>
                </div>
                <div className="mt-4 rounded-2xl border bg-background/70 p-4">
                  <p className="text-sm font-medium">Channel-specific proof expectation</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {proofGuide.buyerPrompt}
                  </p>
                </div>
                <Link href={`/promoters/${promotion.promoter.username}`} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  Open promoter storefront
                  <Sparkles className="h-4 w-4" />
                </Link>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
