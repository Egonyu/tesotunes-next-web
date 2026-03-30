"use client";

import { useRouter } from "next/navigation";
import { PromotionEditor } from "@/components/promotions/promotion-editor";
import { useCreatePromotion } from "@/hooks/usePromotions";
import type { CreatePromotionRequest } from "@/types/promotions";

export default function CreatePromotionPage() {
  const router = useRouter();
  const create = useCreatePromotion();

  const handleSubmit = (payload: CreatePromotionRequest) => {
    create.mutate(payload, {
      onSuccess: () => {
        router.push("/artist/promotions");
      },
    });
  };

  return (
    <PromotionEditor
      mode="create"
      submitLabel="Create service"
      onSubmit={handleSubmit}
      isSubmitting={create.isPending}
      description="Package your TikTok reach, radio slot, DJ support, creator collab, or promotion lane into a service artists can discover and buy with confidence."
    />
  );
}
