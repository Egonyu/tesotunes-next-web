"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Globe,
  Loader2,
  Megaphone,
  Plus,
  Save,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import {
  useMyPromoterProfile,
  useUpdateMyPromoterProfile,
} from "@/hooks/usePromotions";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  PROMOTION_PLATFORM_LABELS,
  PROMOTION_TYPE_LABELS,
  type PromoterPortfolioItem,
  type PromotionPlatform,
  type UpdatePromoterProfileRequest,
} from "@/types/promotions";

const SOCIAL_FIELDS: Array<{
  key: keyof NonNullable<UpdatePromoterProfileRequest["social_links"]>;
  label: string;
  placeholder: string;
}> = [
  {
    key: "instagram_url",
    label: "Instagram",
    placeholder: "https://instagram.com/yourprofile",
  },
  {
    key: "tiktok_url",
    label: "TikTok",
    placeholder: "https://tiktok.com/@yourhandle",
  },
  {
    key: "youtube_url",
    label: "YouTube",
    placeholder: "https://youtube.com/@yourchannel",
  },
  {
    key: "facebook_url",
    label: "Facebook",
    placeholder: "https://facebook.com/yourpage",
  },
  {
    key: "twitter_url",
    label: "Twitter / X",
    placeholder: "https://x.com/yourhandle",
  },
  {
    key: "website_url",
    label: "Website",
    placeholder: "https://yourwebsite.com",
  },
];

const PORTFOLIO_PLATFORM_OPTIONS: PromotionPlatform[] = [
  "instagram",
  "tiktok",
  "radio",
  "club",
  "youtube",
  "podcast",
];

function createEmptyPortfolioItem(): PromoterPortfolioItem {
  return {
    title: "",
    summary: "",
    outcome: "",
    platform: null,
    asset_url: "",
    external_url: "",
  };
}

function createEmptyProfile(): UpdatePromoterProfileRequest {
  return {
    banner_url: "",
    bio: "",
    location: "",
    audience_summary: "",
    response_time_hours: 24,
    proof_points: [""],
    campaign_highlights: [""],
    portfolio_items: [createEmptyPortfolioItem()],
    social_links: {},
  };
}

function normaliseStringList(values: string[] | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function inputClassName() {
  return "mt-2 w-full rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15";
}

function textareaClassName() {
  return `${inputClassName()} resize-none`;
}

export default function PromoterProfileSettingsPage() {
  const { data: profile, isLoading } = useMyPromoterProfile();
  const update = useUpdateMyPromoterProfile();
  const [formData, setFormData] = useState<UpdatePromoterProfileRequest>(
    createEmptyProfile
  );

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFormData({
      banner_url: profile.banner_url ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      audience_summary: profile.audience_summary ?? "",
      response_time_hours: profile.response_time_hours ?? 24,
      proof_points: profile.proof_points?.length ? profile.proof_points : [""],
      campaign_highlights: profile.campaign_highlights?.length
        ? profile.campaign_highlights
        : [""],
      portfolio_items: profile.portfolio_items?.length
        ? profile.portfolio_items.map((item) => ({
            title: item.title ?? "",
            summary: item.summary ?? "",
            outcome: item.outcome ?? "",
            platform: item.platform ?? null,
            asset_url: item.asset_url ?? "",
            external_url: item.external_url ?? "",
          }))
        : [createEmptyPortfolioItem()],
      social_links: {
        instagram_url: profile.social_links.instagram_url ?? "",
        tiktok_url: profile.social_links.tiktok_url ?? "",
        youtube_url: profile.social_links.youtube_url ?? "",
        facebook_url: profile.social_links.facebook_url ?? "",
        twitter_url: profile.social_links.twitter_url ?? "",
        website_url: profile.social_links.website_url ?? "",
      },
    });
  }, [profile]);

  const profileCompletion = useMemo(() => {
    const checks = [
      formData.banner_url?.trim(),
      formData.bio?.trim(),
      formData.location?.trim(),
      formData.audience_summary?.trim(),
      normaliseStringList(formData.proof_points).length > 0,
      normaliseStringList(formData.campaign_highlights).length > 0,
      (formData.portfolio_items ?? []).some((item) => item.title?.trim()),
      Object.values(formData.social_links ?? {}).some((value) => value?.trim()),
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [formData]);

  const socialCount = Object.values(formData.social_links ?? {}).filter((value) =>
    value?.trim()
  ).length;
  const portfolioCount = (formData.portfolio_items ?? []).filter((item) =>
    item.title?.trim()
  ).length;

  const updateArrayField = (
    field: "proof_points" | "campaign_highlights",
    index: number,
    value: string
  ) => {
    const next = [...(formData[field] ?? [""])];
    next[index] = value;
    setFormData((prev) => ({ ...prev, [field]: next }));
  };

  const addArrayField = (field: "proof_points" | "campaign_highlights") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] ?? [""]), ""],
    }));
  };

  const removeArrayField = (
    field: "proof_points" | "campaign_highlights",
    index: number
  ) => {
    setFormData((prev) => {
      const current = prev[field] ?? [""];
      const next = current.filter((_, currentIndex) => currentIndex !== index);

      return {
        ...prev,
        [field]: next.length ? next : [""],
      };
    });
  };

  const updatePortfolioItem = (
    index: number,
    key: keyof PromoterPortfolioItem,
    value: string | null
  ) => {
    const next = [...(formData.portfolio_items ?? [createEmptyPortfolioItem()])];
    next[index] = {
      ...createEmptyPortfolioItem(),
      ...next[index],
      [key]: value,
    };
    setFormData((prev) => ({ ...prev, portfolio_items: next }));
  };

  const addPortfolioItem = () => {
    setFormData((prev) => ({
      ...prev,
      portfolio_items: [...(prev.portfolio_items ?? [createEmptyPortfolioItem()]), createEmptyPortfolioItem()],
    }));
  };

  const removePortfolioItem = (index: number) => {
    setFormData((prev) => {
      const next = (prev.portfolio_items ?? [createEmptyPortfolioItem()]).filter(
        (_, currentIndex) => currentIndex !== index
      );

      return {
        ...prev,
        portfolio_items: next.length ? next : [createEmptyPortfolioItem()],
      };
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    update.mutate({
      ...formData,
      banner_url: formData.banner_url?.trim() || null,
      bio: formData.bio?.trim() || null,
      location: formData.location?.trim() || null,
      audience_summary: formData.audience_summary?.trim() || null,
      proof_points: normaliseStringList(formData.proof_points),
      campaign_highlights: normaliseStringList(formData.campaign_highlights),
      portfolio_items: (formData.portfolio_items ?? [])
        .map((item) => ({
          title: item.title?.trim() || "",
          summary: item.summary?.trim() || null,
          outcome: item.outcome?.trim() || null,
          platform: item.platform || null,
          asset_url: item.asset_url?.trim() || null,
          external_url: item.external_url?.trim() || null,
        }))
        .filter((item) => item.title),
      social_links: Object.fromEntries(
        Object.entries(formData.social_links ?? {}).filter(([, value]) => value?.trim())
      ),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/artist/promotions"
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
              Promoter Identity
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">
              Shape the storefront artists will book from
            </h1>
            <p className="mt-3 text-sm text-muted-foreground lg:text-base">
              Build trust with a clear bio, audience story, proof of performance,
              campaign highlights, and social links. This is the layer that turns a
              TikTok creator, DJ, or radio promoter into a credible service seller on Tesotunes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[28rem]">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Storefront Completion
              </p>
              <p className="mt-2 text-3xl font-semibold">{profileCompletion}%</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Higher completion gives artists more confidence to buy.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Active Services
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {profile?.active_promotions ?? 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Live offers connected to this profile
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_380px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-[28px] border border-border/60 bg-card/90 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Identity & positioning
                </div>
                <h2 className="mt-2 text-xl font-semibold">Tell artists who you are</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Lead with the story that explains your audience, credibility, and what kind of releases you move best.
                </p>
              </div>
              {profile?.is_verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-medium">Banner image URL</label>
                <input
                  type="url"
                  value={formData.banner_url ?? ""}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, banner_url: event.target.value }))
                  }
                  className={inputClassName()}
                  placeholder="https://images.example.com/creator-banner.jpg"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={formData.bio ?? ""}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, bio: event.target.value }))
                  }
                  rows={5}
                  className={textareaClassName()}
                  placeholder="Example: Kampala-based TikTok creator helping Afrobeats and campus records break through short-form culture with creator remixes, reaction clips, and trend-friendly rollout ideas."
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    value={formData.location ?? ""}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, location: event.target.value }))
                    }
                    className={inputClassName()}
                    placeholder="Kampala, Uganda"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Response time (hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={formData.response_time_hours ?? 24}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        response_time_hours: Number(event.target.value),
                      }))
                    }
                    className={inputClassName()}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card/90 p-6">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Target className="h-4 w-4" />
              Audience story
            </div>
            <h2 className="mt-2 text-xl font-semibold">Explain the listeners and viewers you influence</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This should help an artist decide whether your audience matches the release they want to push.
            </p>

            <div className="mt-6">
              <label className="text-sm font-medium">Audience summary</label>
              <textarea
                value={formData.audience_summary ?? ""}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    audience_summary: event.target.value,
                  }))
                }
                rows={4}
                className={textareaClassName()}
                placeholder="Example: Mostly Gen Z listeners in Uganda and Kenya who respond well to Afrobeats, Amapiano, club edits, nightlife snippets, and campus-first rollouts."
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card/90 p-6">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Globe className="h-4 w-4" />
              Social proof
            </div>
            <h2 className="mt-2 text-xl font-semibold">Connect your public channels</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Artists will use these links to validate your audience and understand where your reach actually lives.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {SOCIAL_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium">{field.label}</label>
                  <input
                    type="url"
                    value={formData.social_links?.[field.key] ?? ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        social_links: {
                          ...prev.social_links,
                          [field.key]: event.target.value,
                        },
                      }))
                    }
                    className={inputClassName()}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card/90 p-6">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Users className="h-4 w-4" />
              Proof & highlights
            </div>
            <h2 className="mt-2 text-xl font-semibold">Show real performance signals</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use short, specific statements. Think reach, engagement, creator reposts, spins, playlists, trend participation, or campaign lift.
            </p>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="text-sm font-medium">Proof points</label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Facts that help a buyer trust your delivery.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayField("proof_points")}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium transition hover:bg-background"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add proof point
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {(formData.proof_points ?? [""]).map((item, index) => (
                    <div
                      key={`proof-${index}`}
                      className="rounded-2xl border border-border/60 bg-background/70 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          Proof {index + 1}
                        </p>
                        {(formData.proof_points?.length ?? 0) > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeArrayField("proof_points", index)}
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
                          updateArrayField("proof_points", index, event.target.value)
                        }
                        className={inputClassName()}
                        placeholder="Example: Average 120k weekly views on music clips with strong Uganda + Kenya engagement."
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="text-sm font-medium">Campaign highlights</label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Short examples of past wins or notable campaign outcomes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayField("campaign_highlights")}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium transition hover:bg-background"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add highlight
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {(formData.campaign_highlights ?? [""]).map((item, index) => (
                    <div
                      key={`highlight-${index}`}
                      className="rounded-2xl border border-border/60 bg-background/70 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          Highlight {index + 1}
                        </p>
                        {(formData.campaign_highlights?.length ?? 0) > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeArrayField("campaign_highlights", index)}
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
                          updateArrayField(
                            "campaign_highlights",
                            index,
                            event.target.value
                          )
                        }
                        className={inputClassName()}
                        placeholder="Example: Helped a campus-focused single spread through 25 creator reposts in the first week."
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="text-sm font-medium">Portfolio items</label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add campaign examples with a quick result, reference link, or image.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addPortfolioItem}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium transition hover:bg-background"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add portfolio item
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {(formData.portfolio_items ?? [createEmptyPortfolioItem()]).map(
                    (item, index) => (
                      <div
                        key={`portfolio-${index}`}
                        className="rounded-2xl border border-border/60 bg-background/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                            Portfolio item {index + 1}
                          </p>
                          {(formData.portfolio_items?.length ?? 0) > 1 ? (
                            <button
                              type="button"
                              onClick={() => removePortfolioItem(index)}
                              className="text-xs font-medium text-destructive"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium">Title</label>
                            <input
                              type="text"
                              value={item.title ?? ""}
                              onChange={(event) =>
                                updatePortfolioItem(index, "title", event.target.value)
                              }
                              className={inputClassName()}
                              placeholder="TikTok creator launch for Afro-pop single"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Platform</label>
                            <select
                              value={item.platform ?? ""}
                              onChange={(event) =>
                                updatePortfolioItem(
                                  index,
                                  "platform",
                                  event.target.value || null
                                )
                              }
                              className={inputClassName()}
                            >
                              <option value="">Select platform</option>
                              {PORTFOLIO_PLATFORM_OPTIONS.map((platform) => (
                                <option key={platform} value={platform}>
                                  {PROMOTION_PLATFORM_LABELS[platform]}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium">Summary</label>
                            <textarea
                              value={item.summary ?? ""}
                              onChange={(event) =>
                                updatePortfolioItem(index, "summary", event.target.value)
                              }
                              rows={3}
                              className={textareaClassName()}
                              placeholder="Short context about the campaign, audience, and what the promotion involved."
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Outcome</label>
                            <input
                              type="text"
                              value={item.outcome ?? ""}
                              onChange={(event) =>
                                updatePortfolioItem(index, "outcome", event.target.value)
                              }
                              className={inputClassName()}
                              placeholder="42 creator reposts in 5 days"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Asset image URL</label>
                            <input
                              type="url"
                              value={item.asset_url ?? ""}
                              onChange={(event) =>
                                updatePortfolioItem(index, "asset_url", event.target.value)
                              }
                              className={inputClassName()}
                              placeholder="https://images.example.com/case-study-cover.jpg"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium">Reference link</label>
                            <input
                              type="url"
                              value={item.external_url ?? ""}
                              onChange={(event) =>
                                updatePortfolioItem(index, "external_url", event.target.value)
                              }
                              className={inputClassName()}
                              placeholder="https://tiktok.com/@creator/video/..."
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={update.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
            >
              {update.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save promoter profile
            </button>
            {profile?.username ? (
              <Link
                href={`/promoters/${profile.username}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 px-6 py-3 text-sm font-medium transition hover:bg-background"
              >
                View public storefront
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </form>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <section className="overflow-hidden rounded-[28px] border border-border/60 bg-card/90">
            <div className="relative h-32 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.88))]">
              {formData.banner_url?.trim() ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${formData.banner_url})` }}
                />
              ) : null}
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">
                  Public storefront preview
                </p>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-primary/10 text-2xl font-bold text-primary">
                  {profile?.name?.slice(0, 1) ?? "P"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-lg font-semibold">
                      {profile?.name ?? "Your promoter profile"}
                    </h2>
                    {profile?.is_verified ? (
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{profile?.username ?? "username"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formData.bio?.trim() ||
                      "Add a short bio so artists immediately understand your lane and audience."}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Followers
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {formatNumber(profile?.follower_count ?? 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Active services
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {profile?.active_promotions ?? 0}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-sm font-medium">Audience story</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formData.audience_summary?.trim() ||
                      "Summarise where your audience is, what they respond to, and which releases you move best."}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-sm font-medium">Proof depth</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {normaliseStringList(formData.proof_points).length} proof point(s),{" "}
                    {normaliseStringList(formData.campaign_highlights).length} highlight(s),{" "}
                    {portfolioCount} portfolio item(s), {socialCount} social link(s)
                  </p>
                </div>

                {portfolioCount ? (
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-medium">Portfolio preview</p>
                    <div className="mt-3 space-y-3">
                      {(formData.portfolio_items ?? [])
                        .filter((item) => item.title?.trim())
                        .slice(0, 2)
                        .map((item, index) => (
                          <div
                            key={`${item.title}-${index}`}
                            className="overflow-hidden rounded-2xl border border-border/60 bg-card/70"
                          >
                            {item.asset_url?.trim() ? (
                              <div className="relative h-28">
                                <Image
                                  src={item.asset_url}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : null}
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium">{item.title}</p>
                                {item.platform ? (
                                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                                    {PROMOTION_PLATFORM_LABELS[item.platform]}
                                  </span>
                                ) : null}
                              </div>
                              {item.outcome ? (
                                <p className="mt-2 text-sm text-foreground/85">{item.outcome}</p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : null}

                {profile?.promotions?.length ? (
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-medium">Live service mix</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.platforms.slice(0, 4).map((platform) => (
                        <span
                          key={platform}
                          className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-foreground/80"
                        >
                          {PROMOTION_PLATFORM_LABELS[platform]}
                        </span>
                      ))}
                      {profile.service_types.slice(0, 3).map((type) => (
                        <span
                          key={type}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {PROMOTION_TYPE_LABELS[type]}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card/90 p-6">
            <h2 className="text-lg font-semibold">Storefront checklist</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium">1. Position your identity</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  A strong bio and location help artists understand your lane quickly.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium">2. Clarify audience fit</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell artists which genres, scenes, and listener groups you influence best.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium">3. Add proof</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Specific results beat vague claims every time on a services marketplace.
                </p>
              </div>
            </div>
          </section>

          {profile?.promotions?.length ? (
            <section className="rounded-[28px] border border-border/60 bg-card/90 p-6">
              <h2 className="text-lg font-semibold">Live services snapshot</h2>
              <div className="mt-4 space-y-3">
                {profile.promotions.slice(0, 3).map((promotion) => (
                  <div
                    key={promotion.id}
                    className="rounded-2xl border border-border/60 bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{promotion.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {PROMOTION_PLATFORM_LABELS[promotion.platform]} ·{" "}
                          {PROMOTION_TYPE_LABELS[promotion.type]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatNumber(promotion.price_credits)} cr
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(promotion.price_ugx)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  href="/artist/promotions"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
                >
                  Manage services
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
