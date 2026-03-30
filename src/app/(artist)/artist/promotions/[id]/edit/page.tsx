"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PromotionEditor } from "@/components/promotions/promotion-editor";
import { useMyPromotion, useUpdatePromotion } from "@/hooks/usePromotions";
import type { CreatePromotionRequest } from "@/types/promotions";

export default function EditPromotionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const promotionId = Number(params?.id ?? 0);
  const { data: promotion, isLoading } = useMyPromotion(promotionId);
  const update = useUpdatePromotion(promotionId);

  const handleSubmit = (payload: CreatePromotionRequest) => {
    update.mutate(payload, {
      onSuccess: () => {
        router.push("/artist/promotions");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="space-y-4">
        <Link
          href="/artist/promotions"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to promotions studio
        </Link>
        <div className="rounded-[28px] border border-border/60 bg-card/90 p-6">
          <h1 className="text-lg font-semibold">Promotion not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This service could not be loaded from your seller account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PromotionEditor
      mode="edit"
      initialValues={{
        title: promotion.title,
        short_description: promotion.short_description,
        description: promotion.description,
        type: promotion.type,
        platform: promotion.platform,
        price_credits: promotion.price_credits,
        price_ugx: promotion.price_ugx,
        accepts_credits: promotion.accepts_credits,
        accepts_ugx: promotion.accepts_ugx,
        accepts_hybrid: promotion.accepts_hybrid,
        estimated_reach: promotion.estimated_reach,
        audience_niches: promotion.audience_niches ?? [],
        audience_regions: promotion.audience_regions ?? [],
        content_formats: promotion.content_formats ?? [],
        delivery_days_min: promotion.delivery_days_min,
        delivery_days_max: promotion.delivery_days_max,
        requirements: promotion.requirements ?? undefined,
        platform_specifics: promotion.platform_specifics ?? undefined,
        deliverables: promotion.deliverables ?? [],
        terms: promotion.terms ?? "",
        featured_image: promotion.featured_image ?? "",
      }}
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      isSubmitting={update.isPending}
      status={promotion.status}
      title={`Edit ${promotion.title}`}
      description="Refine the promise, tighten targeting, and keep the service aligned with the storefront artists are already seeing."
      totalOrders={promotion.total_orders}
      completedOrders={promotion.completed_orders}
      ratingAverage={promotion.rating_average}
    />
  );
}
