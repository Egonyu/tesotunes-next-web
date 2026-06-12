'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BadgeCheck,
  Globe,
  Loader2,
  MapPin,
  Megaphone,
  Plus,
  Save,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { ImageUploadInput } from '@/components/ui/image-upload-input';
import { useMyPromoterProfile, useUpdateMyPromoterProfile } from '@/hooks/usePromotions';
import { formatNumber } from '@/lib/utils';
import {
  PROMOTION_PLATFORM_LABELS,
  type PromoterPortfolioItem,
  type PromotionPlatform,
  type UpdatePromoterProfileRequest,
} from '@/types/promotions';
import { cn } from '@/lib/utils';

const SOCIAL_FIELDS: Array<{
  key: keyof NonNullable<UpdatePromoterProfileRequest['social_links']>;
  label: string;
  placeholder: string;
}> = [
  { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/yourprofile' },
  { key: 'tiktok_url', label: 'TikTok', placeholder: 'https://tiktok.com/@yourhandle' },
  { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
  { key: 'twitter_url', label: 'Twitter / X', placeholder: 'https://x.com/yourhandle' },
  { key: 'website_url', label: 'Website', placeholder: 'https://yourwebsite.com' },
];

const PORTFOLIO_PLATFORMS: PromotionPlatform[] = [
  'instagram',
  'tiktok',
  'radio',
  'club',
  'youtube',
  'podcast',
];

function emptyPortfolioItem(): PromoterPortfolioItem {
  return { title: '', summary: '', outcome: '', platform: null, asset_url: '', external_url: '' };
}

type FormState = {
  banner_url: string | null;
  bio: string;
  location: string;
  audience_summary: string;
  response_time_hours: string;
  proof_points: string[];
  campaign_highlights: string[];
  portfolio_items: PromoterPortfolioItem[];
  social_links: NonNullable<UpdatePromoterProfileRequest['social_links']>;
};

export default function PromoterProfilePage() {
  const { data: profile, isLoading } = useMyPromoterProfile();
  const update = useUpdateMyPromoterProfile();

  const [form, setForm] = useState<FormState>({
    banner_url: null,
    bio: '',
    location: '',
    audience_summary: '',
    response_time_hours: '',
    proof_points: [''],
    campaign_highlights: [''],
    portfolio_items: [emptyPortfolioItem()],
    social_links: {},
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      banner_url: profile.banner_url ?? null,
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      audience_summary: profile.audience_summary ?? '',
      response_time_hours: profile.response_time_hours?.toString() ?? '',
      proof_points: profile.proof_points?.length ? profile.proof_points : [''],
      campaign_highlights: profile.campaign_highlights?.length ? profile.campaign_highlights : [''],
      portfolio_items: profile.portfolio_items?.length
        ? profile.portfolio_items
        : [emptyPortfolioItem()],
      social_links: profile.social_links ?? {},
    });
  }, [profile]);

  const handleSave = () => {
    const payload: UpdatePromoterProfileRequest = {
      banner_url: form.banner_url || null,
      bio: form.bio || null,
      location: form.location || null,
      audience_summary: form.audience_summary || null,
      response_time_hours: form.response_time_hours
        ? parseInt(form.response_time_hours)
        : null,
      proof_points: form.proof_points.filter(Boolean),
      campaign_highlights: form.campaign_highlights.filter(Boolean),
      portfolio_items: form.portfolio_items.filter((p) => p.title),
      social_links: form.social_links,
    };

    update.mutate(payload, {
      onSuccess: () => toast.success('Profile updated'),
      onError: (err: Error) => toast.error(err.message || 'Failed to update profile'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/artist/promotions"
            className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Promoter Profile</h1>
            <p className="text-sm text-muted-foreground">
              How artists see you in the marketplace
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={update.isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Profile overview card */}
          {profile && (
            <div className="rounded-xl bg-card p-5 shadow-sm">
              <div className="flex items-start gap-4">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
                    {profile.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{profile.name}</h2>
                    {profile.is_verified && (
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {formatNumber(profile.follower_count)} followers
                    </span>
                    <span className="flex items-center gap-1">
                      <Megaphone className="h-3.5 w-3.5" />
                      {profile.active_promotions} active services
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {profile.average_rating.toFixed(1)} rating
                    </span>
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {profile.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Basic info */}
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <h3 className="mb-4 font-semibold">Basic Information</h3>
            <div className="space-y-4">
              <ImageUploadInput
                label="Profile Banner"
                value={form.banner_url}
                onChange={(url) => setForm({ ...form, banner_url: url })}
                uploadType="cover"
                aspectRatio="banner"
                hint="Shown at the top of your promoter profile — 3:1 ratio recommended"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="w-full resize-none rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe your reach, audience, and what makes you a great promoter…"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Kampala, Uganda"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Typical Response Time (hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.response_time_hours}
                    onChange={(e) =>
                      setForm({ ...form, response_time_hours: e.target.value })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 4"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Audience Summary</label>
                <textarea
                  value={form.audience_summary}
                  onChange={(e) => setForm({ ...form, audience_summary: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe your audience: age group, interests, location, engagement rate…"
                />
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Social Links</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {label}
                  </label>
                  <input
                    type="url"
                    value={form.social_links[key] ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        social_links: { ...form.social_links, [key]: e.target.value || null },
                      })
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Proof points */}
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Proof Points</h3>
              <button
                onClick={() => setForm({ ...form, proof_points: [...form.proof_points, ''] })}
                className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium hover:bg-muted/80"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Concrete stats or achievements artists can trust (e.g. "1M+ TikTok views generated")
            </p>
            <div className="space-y-2">
              {form.proof_points.map((point, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const pts = [...form.proof_points];
                      pts[i] = e.target.value;
                      setForm({ ...form, proof_points: pts });
                    }}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 50K+ TikTok followers in the Afrobeats niche"
                  />
                  {form.proof_points.length > 1 && (
                    <button
                      onClick={() => {
                        const pts = form.proof_points.filter((_, idx) => idx !== i);
                        setForm({ ...form, proof_points: pts });
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Campaign highlights */}
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Campaign Highlights</h3>
              <button
                onClick={() =>
                  setForm({ ...form, campaign_highlights: [...form.campaign_highlights, ''] })
                }
                className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium hover:bg-muted/80"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Notable campaigns you have run before — name the artist or project if possible
            </p>
            <div className="space-y-2">
              {form.campaign_highlights.map((hl, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={hl}
                    onChange={(e) => {
                      const hls = [...form.campaign_highlights];
                      hls[i] = e.target.value;
                      setForm({ ...form, campaign_highlights: hls });
                    }}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Promoted Azawi's new EP on TikTok — 200K views"
                  />
                  {form.campaign_highlights.length > 1 && (
                    <button
                      onClick={() => {
                        const hls = form.campaign_highlights.filter((_, idx) => idx !== i);
                        setForm({ ...form, campaign_highlights: hls });
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio items */}
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Portfolio</h3>
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    portfolio_items: [...form.portfolio_items, emptyPortfolioItem()],
                  })
                }
                className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium hover:bg-muted/80"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>
            <div className="space-y-4">
              {form.portfolio_items.map((item, i) => (
                <div key={i} className="rounded-lg bg-muted/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Item {i + 1}
                    </span>
                    {form.portfolio_items.length > 1 && (
                      <button
                        onClick={() => {
                          const items = form.portfolio_items.filter((_, idx) => idx !== i);
                          setForm({ ...form, portfolio_items: items });
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">Title *</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const items = [...form.portfolio_items];
                          items[i] = { ...items[i], title: e.target.value };
                          setForm({ ...form, portfolio_items: items });
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Campaign name"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">Platform</label>
                      <select
                        value={item.platform ?? ''}
                        onChange={(e) => {
                          const items = [...form.portfolio_items];
                          items[i] = {
                            ...items[i],
                            platform: (e.target.value as PromotionPlatform) || null,
                          };
                          setForm({ ...form, portfolio_items: items });
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select platform</option>
                        {PORTFOLIO_PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {PROMOTION_PLATFORM_LABELS[p] ?? p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-medium">Summary</label>
                      <input
                        type="text"
                        value={item.summary ?? ''}
                        onChange={(e) => {
                          const items = [...form.portfolio_items];
                          items[i] = { ...items[i], summary: e.target.value };
                          setForm({ ...form, portfolio_items: items });
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Short description of the campaign"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">Outcome</label>
                      <input
                        type="text"
                        value={item.outcome ?? ''}
                        onChange={(e) => {
                          const items = [...form.portfolio_items];
                          items[i] = { ...items[i], outcome: e.target.value };
                          setForm({ ...form, portfolio_items: items });
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. 150K impressions, 5K new followers"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">External Link</label>
                      <input
                        type="url"
                        value={item.external_url ?? ''}
                        onChange={(e) => {
                          const items = [...form.portfolio_items];
                          items[i] = { ...items[i], external_url: e.target.value };
                          setForm({ ...form, portfolio_items: items });
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar — profile card preview */}
        <div className="space-y-4">
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Profile Preview
            </h3>
            {profile && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.name}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm">{profile.name}</span>
                      {profile.is_verified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>

                {form.bio && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{form.bio}</p>
                )}

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Followers', value: formatNumber(profile.follower_count) },
                    { label: 'Services', value: String(profile.active_promotions) },
                    { label: 'Rating', value: profile.average_rating.toFixed(1) },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-sm font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                {form.location && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {form.location}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Profile Strength</h3>
            <div className="space-y-2">
              {[
                { label: 'Bio added', done: !!form.bio },
                { label: 'Location set', done: !!form.location },
                { label: 'Social links', done: Object.values(form.social_links).some(Boolean) },
                { label: 'Proof points', done: form.proof_points.some(Boolean) },
                { label: 'Portfolio items', done: form.portfolio_items.some((p) => p.title) },
                { label: 'Audience summary', done: !!form.audience_summary },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className={cn(done ? 'text-foreground' : 'text-muted-foreground')}>
                    {label}
                  </span>
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      done ? 'bg-emerald-500' : 'bg-muted'
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              {(() => {
                const checks = [
                  !!form.bio,
                  !!form.location,
                  Object.values(form.social_links).some(Boolean),
                  form.proof_points.some(Boolean),
                  form.portfolio_items.some((p) => p.title),
                  !!form.audience_summary,
                ];
                const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
                return (
                  <>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Completeness</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
