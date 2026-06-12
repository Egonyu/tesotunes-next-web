"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  CreditCard,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  Plus,
  Radio,
  Save,
  Sparkles,
  Target,
  Ticket,
  Users,
} from "lucide-react";
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type {
  CreatePromotionRequest,
  PromotionAudienceNiche,
  PromotionContentFormat,
  PromotionPlatform,
  PromotionStatus,
  PromotionType,
} from "@/types/promotions";
import {
  PROMOTION_AUDIENCE_NICHE_LABELS,
  PROMOTION_CONTENT_FORMAT_LABELS,
  PROMOTION_PLATFORM_LABELS,
  PROMOTION_TYPE_LABELS,
} from "@/types/promotions";
import { PromotionStatusBadge } from "./promotion-shared";

const PLATFORM_GUIDANCE: Partial<Record<PromotionPlatform, string>> = {
  tiktok:
    "Best for short-form momentum, creator remix culture, trends, and music discovery spikes.",
  instagram:
    "Great for reels, story pushes, creator co-signs, and lifestyle-led discovery.",
  radio:
    "Useful when artists need trusted airplay context, station credibility, and repeat exposure.",
  club: "Strong for DJ support, nightlife visibility, and records built for live environments.",
  youtube:
    "Useful for reaction coverage, long-form breakdowns, and visual storytelling around a release.",
  podcast:
    "Best for interviews, deeper story-led promotion, and audience trust over quick reach.",
};

const TYPE_GUIDANCE: Partial<Record<PromotionType, string>> = {
  social_media_mention:
    "Keep the scope clear: one post, one reel, one story set, or a defined creator mention.",
  live_stream_promotion:
    "Be specific about stream timing, music integration, and what the artist gets after the session.",
  radio_mention:
    "Clarify airtime style, spin count, time band, and whether proof comes as station confirmation or recording.",
  dj_shoutout:
    "Spell out venue or set context, how often the track will be played, and whether drops are included.",
  content_creation:
    "Explain the content format, turnaround time, and whether the artist can reuse the asset.",
  collaboration_offer:
    "Set clear expectations for what collaboration means and how the release benefits.",
};

type PlatformSpecificState = {
  channel: string;
  placement: string;
  proof: string;
  timing: string;
};

type PlatformSpecificLabels = {
  channelLabel: string;
  placementLabel: string;
  proofLabel: string;
  timingLabel: string;
};

const PLATFORM_SPECIFIC_LABELS: Partial<
  Record<PromotionPlatform, PlatformSpecificLabels>
> = {
  tiktok: {
    channelLabel: "Creator handle",
    placementLabel: "Posting angle",
    proofLabel: "Proof expectation",
    timingLabel: "Posting window",
  },
  instagram: {
    channelLabel: "Creator or page handle",
    placementLabel: "Placement type",
    proofLabel: "Story or reel proof expectation",
    timingLabel: "Posting window",
  },
  radio: {
    channelLabel: "Station or show",
    placementLabel: "Airtime context",
    proofLabel: "Airplay proof expectation",
    timingLabel: "Spin window",
  },
  club: {
    channelLabel: "Venue or DJ identity",
    placementLabel: "Set context",
    proofLabel: "Proof of play expectation",
    timingLabel: "Set timing",
  },
  youtube: {
    channelLabel: "Channel name",
    placementLabel: "Placement format",
    proofLabel: "Timestamp proof expectation",
    timingLabel: "Publish window",
  },
  podcast: {
    channelLabel: "Podcast or host",
    placementLabel: "Episode placement",
    proofLabel: "Episode proof expectation",
    timingLabel: "Episode timing",
  },
};

function defaultPlatformSpecifics() {
  return {
    channel: "",
    placement: "",
    proof: "",
    timing: "",
  };
}

function parseTermsAndSpecifics(rawTerms?: string) {
  const TERMS_MARKER_START = "[tesotunes-platform-specifics]";
  const TERMS_MARKER_END = "[/tesotunes-platform-specifics]";

  if (!rawTerms?.trim()) {
    return {
      cleanTerms: "",
      specifics: defaultPlatformSpecifics(),
    };
  }

  const startIndex = rawTerms.indexOf(TERMS_MARKER_START);
  const endIndex = rawTerms.indexOf(TERMS_MARKER_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return {
      cleanTerms: rawTerms,
      specifics: defaultPlatformSpecifics(),
    };
  }

  const block = rawTerms
    .slice(startIndex + TERMS_MARKER_START.length, endIndex)
    .trim();
  const cleanTerms = `${rawTerms.slice(0, startIndex)}${rawTerms.slice(
    endIndex + TERMS_MARKER_END.length
  )}`.trim();

  const specifics = defaultPlatformSpecifics();

  block.split("\n").forEach((line) => {
    const [rawKey, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const key = rawKey.trim().toLowerCase();

    if (!value) {
      return;
    }

    if (key === "channel") specifics.channel = value;
    if (key === "placement") specifics.placement = value;
    if (key === "proof") specifics.proof = value;
    if (key === "timing") specifics.timing = value;
  });

  return {
    cleanTerms,
    specifics,
  };
}

function createDefaultForm(): CreatePromotionRequest {
  return {
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
    audience_niches: [],
    audience_regions: [],
    content_formats: [],
    delivery_days_min: 1,
    delivery_days_max: 3,
    requirements: undefined,
    platform_specifics: undefined,
    deliverables: [],
    terms: "",
    featured_image: "",
  };
}

function normaliseStringList(values: string[] | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function labelClassName() {
  return "text-sm font-medium";
}

function inputClassName() {
  return "mt-2 w-full rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15";
}

function textareaClassName() {
  return `${inputClassName()} resize-none`;
}

function sectionCardClassName() {
  return "rounded-[28px] border border-border/60 bg-card/90 p-6";
}

function multiSelectHintLabel(values: string[]) {
  if (!values.length) {
    return "None selected";
  }

  return `${values.length} selected`;
}

export interface PromotionEditorProps {
  mode: "create" | "edit";
  initialValues?: CreatePromotionRequest;
  submitLabel: string;
  backHref?: string;
  onSubmit: (payload: CreatePromotionRequest) => void;
  isSubmitting?: boolean;
  status?: PromotionStatus;
  title?: string;
  description?: string;
  totalOrders?: number;
  completedOrders?: number;
  ratingAverage?: number;
}

export function PromotionEditor({
  mode,
  initialValues,
  submitLabel,
  backHref = "/artist/promotions",
  onSubmit,
  isSubmitting = false,
  status,
  title,
  description,
  totalOrders,
  completedOrders,
  ratingAverage,
}: PromotionEditorProps) {
  const [formData, setFormData] = useState<CreatePromotionRequest>(
    initialValues ?? createDefaultForm()
  );
  const [deliverables, setDeliverables] = useState<string[]>(
    initialValues?.deliverables?.length ? initialValues.deliverables : [""]
  );
  const [audienceRegions, setAudienceRegions] = useState<string[]>(
    initialValues?.audience_regions?.length ? initialValues.audience_regions : [""]
  );
  const initialTermsState = useMemo(
    () => parseTermsAndSpecifics(initialValues?.terms),
    [initialValues?.terms]
  );
  const initialPlatformSpecifics = useMemo(
    () => ({
      ...defaultPlatformSpecifics(),
      ...initialTermsState.specifics,
      ...(initialValues?.platform_specifics ?? {}),
    }),
    [initialTermsState.specifics, initialValues?.platform_specifics]
  );
  const [terms, setTerms] = useState(initialTermsState.cleanTerms);
  const [requirementAction, setRequirementAction] = useState(
    initialValues?.requirements?.action ?? ""
  );
  const [requirementDuration, setRequirementDuration] = useState<number | "">(
    initialValues?.requirements?.duration_hours ?? ""
  );
  const [hashtagInput, setHashtagInput] = useState(
    (initialValues?.requirements?.hashtags ?? []).join(", ")
  );
  const [platformSpecifics, setPlatformSpecifics] = useState(
    initialPlatformSpecifics
  );

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    setFormData(initialValues);
    setDeliverables(initialValues.deliverables?.length ? initialValues.deliverables : [""]);
    setAudienceRegions(
      initialValues.audience_regions?.length ? initialValues.audience_regions : [""]
    );
    const parsedTerms = parseTermsAndSpecifics(initialValues.terms);
    setTerms(parsedTerms.cleanTerms);
    setPlatformSpecifics({
      ...defaultPlatformSpecifics(),
      ...parsedTerms.specifics,
      ...(initialValues.platform_specifics ?? {}),
    });
    setRequirementAction(initialValues.requirements?.action ?? "");
    setRequirementDuration(initialValues.requirements?.duration_hours ?? "");
    setHashtagInput((initialValues.requirements?.hashtags ?? []).join(", "));
  }, [initialValues]);

  const completion = useMemo(() => {
    const checks = [
      formData.title.trim(),
      formData.short_description.trim(),
      formData.description.trim(),
      formData.featured_image,
      formData.estimated_reach > 0,
      normaliseStringList(formData.audience_niches).length > 0,
      normaliseStringList(formData.content_formats).length > 0,
      normaliseStringList(audienceRegions).length > 0,
      normaliseStringList(deliverables).length > 0,
      requirementAction.trim(),
      terms.trim(),
      Object.values(platformSpecifics).some((value) => value.trim()),
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [audienceRegions, deliverables, formData, platformSpecifics, requirementAction, terms]);

  const hashtags = hashtagInput
    .split(",")
    .map((value) => value.trim().replace(/^#/, ""))
    .filter(Boolean);

  const paymentModes = [
    formData.accepts_credits ? "Credits" : null,
    formData.accepts_ugx ? "UGX Wallet" : null,
    formData.accepts_hybrid ? "Hybrid" : null,
  ].filter(Boolean) as string[];

  const guidance =
    TYPE_GUIDANCE[formData.type] ||
    PLATFORM_GUIDANCE[formData.platform] ||
    "Keep the promise clear, platform-specific, and measurable for the buyer.";

  const heroTitle =
    title ??
    (mode === "create"
      ? "Create a promotion service artists can trust"
      : "Refine your service before artists book it");

  const heroDescription =
    description ??
    (mode === "create"
      ? "Build a real marketplace offer with a clear promise, audience fit, delivery scope, and measurable proof."
      : "Tighten the details, update targeting, and keep the service aligned with what buyers actually need.");

  const updateField = <K extends keyof CreatePromotionRequest>(
    key: K,
    value: CreatePromotionRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateArrayValue = (
    values: string[],
    setValues: Dispatch<SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const next = [...values];
    next[index] = value;
    setValues(next);
  };

  const addArrayValue = (
    values: string[],
    setValues: Dispatch<SetStateAction<string[]>>
  ) => {
    setValues([...values, ""]);
  };

  const removeArrayValue = (
    values: string[],
    setValues: Dispatch<SetStateAction<string[]>>,
    index: number
  ) => {
    const next = values.filter((_, currentIndex) => currentIndex !== index);
    setValues(next.length ? next : [""]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      short_description: formData.short_description.trim(),
      description: formData.description.trim(),
      audience_regions: normaliseStringList(audienceRegions),
      deliverables: normaliseStringList(deliverables),
      terms: terms.trim() || undefined,
      featured_image: formData.featured_image?.trim() || undefined,
      platform_specifics: Object.values(platformSpecifics).some((value) => value.trim())
        ? {
            channel: platformSpecifics.channel.trim() || undefined,
            placement: platformSpecifics.placement.trim() || undefined,
            proof: platformSpecifics.proof.trim() || undefined,
            timing: platformSpecifics.timing.trim() || undefined,
          }
        : undefined,
      requirements: requirementAction.trim()
        ? {
            action: requirementAction.trim(),
            duration_hours:
              requirementDuration === "" ? undefined : requirementDuration,
            hashtags: hashtags.length ? hashtags : undefined,
          }
        : undefined,
    });
  };

  const isSubmitDisabled =
    isSubmitting ||
    !formData.title.trim() ||
    !formData.short_description.trim() ||
    !formData.description.trim();
  const platformSpecificLabels =
    PLATFORM_SPECIFIC_LABELS[formData.platform] ?? {
      channelLabel: "Channel or account",
      placementLabel: "Placement context",
      proofLabel: "Proof expectation",
      timingLabel: "Timing window",
    };

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to promotions studio
      </Link>

      <section className="relative overflow-hidden rounded-[30px] border border-border/60 bg-card/95 p-6 shadow-xl shadow-black/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.08),transparent_65%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Megaphone className="h-3.5 w-3.5" />
              {mode === "create" ? "New Service" : "Offer Builder"}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                {heroTitle}
              </h1>
              {status ? <PromotionStatusBadge status={status} /> : null}
            </div>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground lg:text-base">
              {heroDescription}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-md">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Offer completion
              </p>
              <p className="mt-2 text-3xl font-semibold">{completion}%</p>
              <p className="mt-1 text-xs text-muted-foreground">
                A fuller listing gives artists more confidence to buy.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Delivery lane
              </p>
              <p className="mt-2 text-lg font-semibold">
                {PROMOTION_PLATFORM_LABELS[formData.platform]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {PROMOTION_TYPE_LABELS[formData.type]}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_380px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className={sectionCardClassName()}>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Offer identity
            </div>
            <h2 className="mt-2 text-xl font-semibold">Describe the service clearly</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your title, summary, platform, and type should help an artist understand the offer in seconds.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className={labelClassName()}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Example: TikTok launch boost for Afrobeats singles"
                  required
                  className={inputClassName()}
                />
              </div>

              <div>
                <label className={labelClassName()}>Short description</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(event) =>
                    updateField("short_description", event.target.value)
                  }
                  placeholder="One-line summary of the promise and buyer outcome"
                  required
                  maxLength={255}
                  className={inputClassName()}
                />
              </div>

              <div>
                <label className={labelClassName()}>Full description</label>
                <textarea
                  value={formData.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  rows={5}
                  required
                  className={textareaClassName()}
                  placeholder="Explain how the service works, what the artist sends, how delivery happens, and what makes your audience or channel valuable."
                />
              </div>

              <ImageUploadInput
                label="Featured Image"
                value={formData.featured_image}
                onChange={(url) => updateField("featured_image", url ?? "")}
                uploadType="cover"
                aspectRatio="video"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClassName()}>Promotion type</label>
                  <select
                    value={formData.type}
                    onChange={(event) =>
                      updateField("type", event.target.value as PromotionType)
                    }
                    className={inputClassName()}
                  >
                    {Object.entries(PROMOTION_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClassName()}>Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(event) =>
                      updateField(
                        "platform",
                        event.target.value as PromotionPlatform
                      )
                    }
                    className={inputClassName()}
                  >
                    {Object.entries(PROMOTION_PLATFORM_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className={sectionCardClassName()}>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <CreditCard className="h-4 w-4" />
              Pricing & checkout
            </div>
            <h2 className="mt-2 text-xl font-semibold">Set a buyer-friendly price</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Artists should understand both the credits price and the wallet equivalent before they buy.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClassName()}>Price in credits</label>
                <input
                  type="number"
                  value={formData.price_credits}
                  onChange={(event) =>
                    updateField("price_credits", Number(event.target.value))
                  }
                  min={100}
                  required
                  className={inputClassName()}
                />
              </div>
              <div>
                <label className={labelClassName()}>Price in UGX</label>
                <input
                  type="number"
                  value={formData.price_ugx}
                  onChange={(event) =>
                    updateField("price_ugx", Number(event.target.value))
                  }
                  min={1000}
                  required
                  className={inputClassName()}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <label className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.accepts_credits}
                    onChange={(event) =>
                      updateField("accepts_credits", event.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="font-medium">Credits</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Good for in-platform purchases and blended checkout.
                </p>
              </label>
              <label className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.accepts_ugx}
                    onChange={(event) =>
                      updateField("accepts_ugx", event.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="font-medium">UGX wallet</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Useful for buyers paying directly in local currency.
                </p>
              </label>
              <label className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.accepts_hybrid}
                    onChange={(event) =>
                      updateField("accepts_hybrid", event.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="font-medium">Hybrid</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Lets buyers mix credits and UGX in one order.
                </p>
              </label>
            </div>
          </section>

          <section className={sectionCardClassName()}>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Target className="h-4 w-4" />
              Audience fit & delivery
            </div>
            <h2 className="mt-2 text-xl font-semibold">Show who this service reaches</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Audience and delivery clarity are what help the right artist pick you instead of another promoter.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClassName()}>Estimated reach</label>
                <input
                  type="number"
                  value={formData.estimated_reach}
                  onChange={(event) =>
                    updateField("estimated_reach", Number(event.target.value))
                  }
                  min={1}
                  required
                  className={inputClassName()}
                />
              </div>
              <div>
                <label className={labelClassName()}>Min delivery days</label>
                <input
                  type="number"
                  value={formData.delivery_days_min}
                  onChange={(event) =>
                    updateField("delivery_days_min", Number(event.target.value))
                  }
                  min={1}
                  max={30}
                  required
                  className={inputClassName()}
                />
              </div>
              <div>
                <label className={labelClassName()}>Max delivery days</label>
                <input
                  type="number"
                  value={formData.delivery_days_max}
                  onChange={(event) =>
                    updateField("delivery_days_max", Number(event.target.value))
                  }
                  min={formData.delivery_days_min}
                  max={30}
                  required
                  className={inputClassName()}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClassName()}>Audience niches</label>
                  <span className="text-xs text-muted-foreground">
                    {multiSelectHintLabel(formData.audience_niches ?? [])}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(PROMOTION_AUDIENCE_NICHE_LABELS).map(
                    ([value, label]) => {
                      const checked = (formData.audience_niches ?? []).includes(
                        value as PromotionAudienceNiche
                      );
                      return (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${checked ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 bg-background/70 hover:bg-muted/50"}`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => {
                              const current = formData.audience_niches ?? [];
                              updateField(
                                "audience_niches",
                                checked
                                  ? current.filter((v) => v !== value)
                                  : [...current, value as PromotionAudienceNiche]
                              );
                            }}
                          />
                          <span
                            className={`h-3.5 w-3.5 shrink-0 rounded border transition-colors ${checked ? "border-primary bg-primary" : "border-border"}`}
                          />
                          {label}
                        </label>
                      );
                    }
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClassName()}>Content formats</label>
                  <span className="text-xs text-muted-foreground">
                    {multiSelectHintLabel(formData.content_formats ?? [])}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(PROMOTION_CONTENT_FORMAT_LABELS).map(
                    ([value, label]) => {
                      const checked = (formData.content_formats ?? []).includes(
                        value as PromotionContentFormat
                      );
                      return (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${checked ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 bg-background/70 hover:bg-muted/50"}`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => {
                              const current = formData.content_formats ?? [];
                              updateField(
                                "content_formats",
                                checked
                                  ? current.filter((v) => v !== value)
                                  : [...current, value as PromotionContentFormat]
                              );
                            }}
                          />
                          <span
                            className={`h-3.5 w-3.5 shrink-0 rounded border transition-colors ${checked ? "border-primary bg-primary" : "border-border"}`}
                          />
                          {label}
                        </label>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label className={labelClassName()}>Audience regions</label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add cities, countries, or audience clusters this service performs best in.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addArrayValue(audienceRegions, setAudienceRegions)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium transition hover:bg-background"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add region
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {audienceRegions.map((item, index) => (
                  <div
                    key={`region-${index}`}
                    className="rounded-2xl border border-border/60 bg-background/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        Region {index + 1}
                      </p>
                      {audienceRegions.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayValue(audienceRegions, setAudienceRegions, index)
                          }
                          className="text-xs font-medium text-destructive"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <input
                      type="text"
                      value={item}
                      onChange={(event) =>
                        updateArrayValue(
                          audienceRegions,
                          setAudienceRegions,
                          index,
                          event.target.value
                        )
                      }
                      placeholder="Example: Kampala, Nairobi, East Africa, diaspora"
                      className={inputClassName()}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={sectionCardClassName()}>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Radio className="h-4 w-4" />
              Platform specifics
            </div>
            <h2 className="mt-2 text-xl font-semibold">Add channel-specific clarity</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These fields help artists and admins understand the exact lane of the offer even before deeper backend-specific modeling lands.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClassName()}>
                  {platformSpecificLabels.channelLabel}
                </label>
                <input
                  type="text"
                  value={platformSpecifics.channel}
                  onChange={(event) =>
                    setPlatformSpecifics((prev) => ({
                      ...prev,
                      channel: event.target.value,
                    }))
                  }
                  placeholder="Example: Teso FM Drive Time, DJ Malo Friday set, @nina.waves"
                  className={inputClassName()}
                />
              </div>
              <div>
                <label className={labelClassName()}>
                  {platformSpecificLabels.placementLabel}
                </label>
                <input
                  type="text"
                  value={platformSpecifics.placement}
                  onChange={(event) =>
                    setPlatformSpecifics((prev) => ({
                      ...prev,
                      placement: event.target.value,
                    }))
                  }
                  placeholder="Example: drive time spin, story + reel, live set shoutout"
                  className={inputClassName()}
                />
              </div>
              <div>
                <label className={labelClassName()}>
                  {platformSpecificLabels.proofLabel}
                </label>
                <input
                  type="text"
                  value={platformSpecifics.proof}
                  onChange={(event) =>
                    setPlatformSpecifics((prev) => ({
                      ...prev,
                      proof: event.target.value,
                    }))
                  }
                  placeholder="Example: station log + recorded clip, post URL + screenshots"
                  className={inputClassName()}
                />
              </div>
              <div>
                <label className={labelClassName()}>
                  {platformSpecificLabels.timingLabel}
                </label>
                <input
                  type="text"
                  value={platformSpecifics.timing}
                  onChange={(event) =>
                    setPlatformSpecifics((prev) => ({
                      ...prev,
                      timing: event.target.value,
                    }))
                  }
                  placeholder="Example: within 48 hours, weekend slot, 7pm-10pm set"
                  className={inputClassName()}
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium">How this is used right now</p>
              <p className="mt-2 text-sm text-muted-foreground">
                These specifics are saved into the listing terms block so public detail, admin review, and dispute handling have more channel-aware context immediately.
              </p>
            </div>
          </section>

          <section className={sectionCardClassName()}>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Ticket className="h-4 w-4" />
              Requirements & deliverables
            </div>
            <h2 className="mt-2 text-xl font-semibold">Set expectations before checkout</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Buyers should know what they need to send, what they will receive, and how the work will be verified.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className={labelClassName()}>What the artist needs to provide</label>
                <input
                  type="text"
                  value={requirementAction}
                  onChange={(event) => setRequirementAction(event.target.value)}
                  placeholder="Example: Share the song link, preferred snippet, and 3 campaign hashtags"
                  className={inputClassName()}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClassName()}>Optional duration in hours</label>
                  <input
                    type="number"
                    value={requirementDuration}
                    onChange={(event) =>
                      setRequirementDuration(
                        event.target.value ? Number(event.target.value) : ""
                      )
                    }
                    min={1}
                    placeholder="24"
                    className={inputClassName()}
                  />
                </div>
                <div>
                  <label className={labelClassName()}>Suggested hashtags</label>
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(event) => setHashtagInput(event.target.value)}
                    placeholder="tesotunes, afrobeats, newmusic"
                    className={inputClassName()}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className={labelClassName()}>Deliverables</label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      List exactly what the buyer gets after purchase.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayValue(deliverables, setDeliverables)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium transition hover:bg-background"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add deliverable
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {deliverables.map((item, index) => (
                    <div
                      key={`deliverable-${index}`}
                      className="rounded-2xl border border-border/60 bg-background/70 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          Deliverable {index + 1}
                        </p>
                        {deliverables.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayValue(deliverables, setDeliverables, index)
                            }
                            className="text-xs font-medium text-destructive"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <input
                        type="text"
                        value={item}
                        onChange={(event) =>
                          updateArrayValue(
                            deliverables,
                            setDeliverables,
                            index,
                            event.target.value
                          )
                        }
                        placeholder="Example: 1 TikTok video post, 2 story reposts, proof screenshot"
                        className={inputClassName()}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClassName()}>Terms & conditions</label>
                <textarea
                  value={terms}
                  onChange={(event) => setTerms(event.target.value)}
                  rows={4}
                  className={textareaClassName()}
                  placeholder="Clarify revision rules, prohibited content, rescheduling, brand-safety limits, or anything else the buyer should know before checkout."
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {submitLabel}
            </button>
            <Link
              href={backHref}
              className="inline-flex items-center justify-center rounded-2xl border border-border/60 px-6 py-3 text-sm font-medium transition hover:bg-background"
            >
              Cancel
            </Link>
          </div>
        </form>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <section className="overflow-hidden rounded-[28px] border border-border/60 bg-card/90">
            <div className="relative h-40 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.88))]">
              {formData.featured_image ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${formData.featured_image})` }}
                />
              ) : null}
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                  Buyer preview
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-white/85">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {formData.featured_image ? "Cover set" : "No cover"}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary">
                    {PROMOTION_TYPE_LABELS[formData.type]}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold">
                    {formData.title || "Your service title will show here"}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formData.short_description ||
                      "A strong short description should explain the outcome, not just the format."}
                  </p>
                </div>
                {status ? <PromotionStatusBadge status={status} /> : null}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Price
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {formatNumber(formData.price_credits)} cr
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(formData.price_ugx)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Reach
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {formatNumber(formData.estimated_reach)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Estimated audience
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-foreground/80">
                  {PROMOTION_PLATFORM_LABELS[formData.platform]}
                </span>
                {(formData.audience_niches ?? []).slice(0, 3).map((niche) => (
                  <span
                    key={niche}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {PROMOTION_AUDIENCE_NICHE_LABELS[niche]}
                  </span>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Delivery window</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formData.delivery_days_min === formData.delivery_days_max
                      ? `${formData.delivery_days_min} day${
                          formData.delivery_days_min === 1 ? "" : "s"
                        }`
                      : `${formData.delivery_days_min}-${formData.delivery_days_max} days`}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Payment methods</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {paymentModes.length ? (
                      paymentModes.map((modeItem) => (
                        <span
                          key={modeItem}
                          className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-foreground/80"
                        >
                          {modeItem}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Choose at least one payment method.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={sectionCardClassName()}>
            <h2 className="text-lg font-semibold">Seller guidance</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                  <p className="font-medium">What will make this listing stronger</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{guidance}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="font-medium">Audience fit</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Artists convert better when the audience niche, region, and content format are specific instead of generic.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-primary" />
                  <p className="font-medium">Scope clarity</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use deliverables and terms to remove uncertainty before the artist places an order.
                </p>
              </div>
            </div>
          </section>

          <section className={sectionCardClassName()}>
            <h2 className="text-lg font-semibold">Marketplace snapshot</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Current stats
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatNumber(totalOrders ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatNumber(completedOrders ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="mt-1 text-lg font-semibold">
                      {(ratingAverage ?? 0).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium">Verification-ready offers win trust</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Build your listing so the buyer can clearly prove delivery and the seller can verify it without friction.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
