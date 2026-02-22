"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCreatePromotion } from "@/hooks/usePromotions";
import type {
  PromotionType,
  PromotionPlatform,
  CreatePromotionRequest,
} from "@/types/promotions";
import {
  PROMOTION_TYPE_LABELS,
  PROMOTION_PLATFORM_LABELS,
} from "@/types/promotions";

export default function CreatePromotionPage() {
  const router = useRouter();
  const create = useCreatePromotion();

  const [formData, setFormData] = useState<CreatePromotionRequest>({
    title: "",
    short_description: "",
    description: "",
    type: "social_media_mention",
    platform: "instagram",
    price_credits: 500,
    price_ugx: 5000,
    accepts_credits: true,
    accepts_ugx: true,
    accepts_hybrid: true,
    estimated_reach: 1000,
    delivery_days_min: 1,
    delivery_days_max: 3,
  });

  const [deliverables, setDeliverables] = useState<string[]>([""]);
  const [terms, setTerms] = useState("");
  const [requirementAction, setRequirementAction] = useState("");

  const updateField = <K extends keyof CreatePromotionRequest>(
    key: K,
    value: CreatePromotionRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreatePromotionRequest = {
      ...formData,
      deliverables: deliverables.filter(Boolean),
      terms: terms || undefined,
      requirements: requirementAction
        ? { action: requirementAction }
        : undefined,
    };

    create.mutate(payload, {
      onSuccess: () => {
        router.push("/artist/promotions");
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/artist/promotions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Promotions
      </Link>

      <div>
        <h1 className="text-xl font-bold">Create New Promotion</h1>
        <p className="text-sm text-muted-foreground">
          List your promotional service for artists to discover and purchase
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">Basic Information</h3>

          <div>
            <label className="text-sm font-medium">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g., TikTok Live Shoutout (10k+ viewers)"
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Short Description *</label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) =>
                updateField("short_description", e.target.value)
              }
              placeholder="Brief summary of what you offer"
              required
              maxLength={255}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Full Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Detailed description of your promotional service..."
              required
              rows={5}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Type *</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  updateField("type", e.target.value as PromotionType)
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Object.entries(PROMOTION_TYPE_LABELS).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Platform *</label>
              <select
                value={formData.platform}
                onChange={(e) =>
                  updateField(
                    "platform",
                    e.target.value as PromotionPlatform
                  )
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Object.entries(PROMOTION_PLATFORM_LABELS).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">Pricing & Payment</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Price (Credits) *</label>
              <input
                type="number"
                value={formData.price_credits}
                onChange={(e) =>
                  updateField("price_credits", Number(e.target.value))
                }
                min={100}
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price (UGX) *</label>
              <input
                type="number"
                value={formData.price_ugx}
                onChange={(e) =>
                  updateField("price_ugx", Number(e.target.value))
                }
                min={1000}
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.accepts_credits}
                onChange={(e) =>
                  updateField("accepts_credits", e.target.checked)
                }
                className="rounded"
              />
              Accept Credits
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.accepts_ugx}
                onChange={(e) =>
                  updateField("accepts_ugx", e.target.checked)
                }
                className="rounded"
              />
              Accept UGX
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.accepts_hybrid}
                onChange={(e) =>
                  updateField("accepts_hybrid", e.target.checked)
                }
                className="rounded"
              />
              Accept Hybrid
            </label>
          </div>
        </div>

        {/* Reach & Delivery */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">Reach & Delivery</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">
                Estimated Reach *
              </label>
              <input
                type="number"
                value={formData.estimated_reach}
                onChange={(e) =>
                  updateField("estimated_reach", Number(e.target.value))
                }
                min={1}
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Min Delivery Days *
              </label>
              <input
                type="number"
                value={formData.delivery_days_min}
                onChange={(e) =>
                  updateField(
                    "delivery_days_min",
                    Number(e.target.value)
                  )
                }
                min={1}
                max={30}
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Max Delivery Days *
              </label>
              <input
                type="number"
                value={formData.delivery_days_max}
                onChange={(e) =>
                  updateField(
                    "delivery_days_max",
                    Number(e.target.value)
                  )
                }
                min={formData.delivery_days_min}
                max={30}
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">Requirements & Deliverables</h3>

          <div>
            <label className="text-sm font-medium">
              What artists need to do
            </label>
            <input
              type="text"
              value={requirementAction}
              onChange={(e) => setRequirementAction(e.target.value)}
              placeholder="e.g., Share song link and preferred hashtags"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              What you will deliver
            </label>
            {deliverables.map((item, i) => (
              <div key={i} className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...deliverables];
                    next[i] = e.target.value;
                    setDeliverables(next);
                  }}
                  placeholder={`Deliverable ${i + 1}`}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {deliverables.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDeliverables(
                        deliverables.filter((_, j) => j !== i)
                      )
                    }
                    className="px-2 text-destructive text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setDeliverables([...deliverables, ""])}
              className="text-primary text-xs mt-2 hover:underline"
            >
              + Add deliverable
            </button>
          </div>

          <div>
            <label className="text-sm font-medium">
              Terms & Conditions
            </label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Your terms for this promotion..."
              rows={3}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={
              create.isPending ||
              !formData.title ||
              !formData.short_description ||
              !formData.description
            }
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2"
          >
            {create.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Create Promotion
          </button>
          <Link
            href="/artist/promotions"
            className="px-6 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
