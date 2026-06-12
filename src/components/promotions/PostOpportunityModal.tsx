"use client";

import { useState } from "react";
import Image from "next/image";
import { Music, X, Megaphone, Calendar, Coins, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateOpportunity } from "@/hooks/usePromotionsV2";
import type { PromotableType } from "@/types/promotions-v2";

// ---------------------------------------------------------------------------
// Static option lists
// ---------------------------------------------------------------------------

const PLATFORM_OPTIONS = [
  "YouTube",
  "TikTok",
  "Instagram",
  "Twitter / X",
  "Facebook",
  "Spotify",
  "Apple Music",
  "SoundCloud",
  "Boomplay",
  "Audiomack",
  "WhatsApp",
  "Telegram",
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PostOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  promotableType: PromotableType;
  promotableId: number;
  title: string;
  artworkUrl: string | null | undefined;
}

// ---------------------------------------------------------------------------
// Inline Chip
// ---------------------------------------------------------------------------

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card border-border hover:bg-muted text-foreground"
      )}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PostOpportunityModal({
  open,
  onClose,
  promotableType,
  promotableId,
  title,
  artworkUrl,
}: PostOpportunityModalProps) {
  const [opportunityTitle, setOpportunityTitle] = useState(`Promote: ${title}`);
  const [brief, setBrief] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadline, setDeadline] = useState("");

  const { mutate: createOpportunity, isPending } = useCreateOpportunity();

  function togglePlatform(platform: string) {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!opportunityTitle.trim()) return;

    createOpportunity(
      {
        promotable_type: promotableType,
        promotable_id: promotableId,
        title: opportunityTitle.trim(),
        brief: brief.trim() || undefined,
        target_platforms: platforms.length > 0 ? platforms : undefined,
        budget_min_ugx: budgetMin ? Number(budgetMin) : undefined,
        budget_max_ugx: budgetMax ? Number(budgetMax) : undefined,
        deadline_at: deadline || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      }
    );
  }

  function resetForm() {
    setOpportunityTitle(`Promote: ${title}`);
    setBrief("");
    setPlatforms([]);
    setBudgetMin("");
    setBudgetMax("");
    setDeadline("");
  }

  function handleClose() {
    onClose();
  }

  if (!open) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-lg bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base">Post Promotion Opportunity</h2>
              <p className="text-xs text-muted-foreground capitalize">{promotableType}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
        >
          {/* Track preview */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="relative w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
              {artworkUrl ? (
                <Image
                  src={artworkUrl}
                  alt={title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <Music className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{title}</p>
              <p className="text-xs text-muted-foreground capitalize">{promotableType}</p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Opportunity Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={opportunityTitle}
              onChange={(e) => setOpportunityTitle(e.target.value)}
              maxLength={120}
              required
              placeholder="e.g. Need a TikTok review for my new release"
              className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {opportunityTitle.length}/120
            </p>
          </div>

          {/* Brief */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Brief</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Describe what you want promoters to do — tone, audience, content style..."
              className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Target Platforms */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  selected={platforms.includes(p)}
                  onClick={() => togglePlatform(p)}
                />
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              <Coins className="inline h-4 w-4 mr-1 text-muted-foreground" />
              Budget Range (UGX)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                min={0}
                placeholder="Min"
                className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-muted-foreground">–</span>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                min={0}
                placeholder="Max"
                className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              <Calendar className="inline h-4 w-4 mr-1 text-muted-foreground" />
              Application Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={today}
              className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t shrink-0 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-full border font-semibold text-sm hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={isPending || !opportunityTitle.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              "Posting..."
            ) : (
              <>
                Post Opportunity
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
