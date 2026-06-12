'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  CreditCard,
  Loader2,
  Megaphone,
  Plus,
  Radio,
  Save,
  Star,
  Target,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { ImageUploadInput } from '@/components/ui/image-upload-input';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { useCreatePromotion } from '@/hooks/usePromotions';
import type {
  CreatePromotionRequest,
  PromotionAudienceNiche,
  PromotionContentFormat,
  PromotionPlatform,
  PromotionType,
} from '@/types/promotions';
import {
  PROMOTION_AUDIENCE_NICHE_LABELS,
  PROMOTION_CONTENT_FORMAT_LABELS,
  PROMOTION_PLATFORM_LABELS,
  PROMOTION_TYPE_LABELS,
} from '@/types/promotions';

const PLATFORM_GUIDANCE: Partial<Record<PromotionPlatform, string>> = {
  tiktok: 'Best for short-form momentum, remix culture, trends, and discovery spikes.',
  instagram: 'Great for reels, story pushes, creator co-signs, and lifestyle discovery.',
  radio: 'Useful when artists need trusted airplay context and repeat exposure.',
  club: 'Strong for DJ support, nightlife visibility, and live environment records.',
  youtube: 'Good for reaction coverage, long-form breakdowns, and visual storytelling.',
  podcast: 'Best for interviews, story-led promotion, and deep audience trust.',
};

const TYPE_GUIDANCE: Partial<Record<PromotionType, string>> = {
  social_media_mention: 'Keep the scope clear: one post, one reel, or a defined creator mention.',
  live_stream_promotion: 'Specify timing, music integration, and what the artist gets after.',
  radio_mention: 'Clarify spin count, time band, and whether proof comes as station confirmation.',
  dj_shoutout: 'Spell out venue context, how often the track plays, and if drops are included.',
  content_creation: 'Explain format, turnaround, and whether the artist can reuse the asset.',
};

const PLATFORM_SPECIFIC_LABELS: Partial<
  Record<PromotionPlatform, { channel: string; placement: string; proof: string; timing: string }>
> = {
  tiktok: { channel: 'Creator handle', placement: 'Posting angle', proof: 'Proof expectation', timing: 'Posting window' },
  instagram: { channel: 'Creator or page handle', placement: 'Placement type', proof: 'Story or reel proof', timing: 'Posting window' },
  radio: { channel: 'Station or show', placement: 'Airtime context', proof: 'Airplay proof', timing: 'Spin window' },
  club: { channel: 'Venue or DJ identity', placement: 'Set context', proof: 'Proof of play', timing: 'Set timing' },
  youtube: { channel: 'Channel name', placement: 'Placement format', proof: 'Timestamp proof', timing: 'Publish window' },
  podcast: { channel: 'Podcast or host', placement: 'Episode placement', proof: 'Episode proof', timing: 'Episode timing' },
};

function createDefault(): CreatePromotionRequest {
  return {
    title: '',
    short_description: '',
    description: '',
    type: 'social_media_mention',
    platform: 'instagram',
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
    terms: '',
    featured_image: '',
  };
}

function normalise(arr: string[] | undefined) {
  return (arr ?? []).map((v) => v.trim()).filter(Boolean);
}

function addItem(arr: string[], set: Dispatch<SetStateAction<string[]>>) {
  set([...arr, '']);
}

function removeItem(arr: string[], set: Dispatch<SetStateAction<string[]>>, i: number) {
  const next = arr.filter((_, idx) => idx !== i);
  set(next.length ? next : ['']);
}

function updateItem(arr: string[], set: Dispatch<SetStateAction<string[]>>, i: number, v: string) {
  const next = [...arr];
  next[i] = v;
  set(next);
}

const inputCls =
  'w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/60';
const textareaCls = inputCls + ' resize-none';
const labelCls = 'block mb-1.5 text-sm font-medium';

export default function CreatePromotionPage() {
  const router = useRouter();
  const create = useCreatePromotion();

  const [form, setForm] = useState<CreatePromotionRequest>(createDefault());
  const [deliverables, setDeliverables] = useState(['']);
  const [regions, setRegions] = useState(['']);
  const [requirementAction, setRequirementAction] = useState('');
  const [requirementDuration, setRequirementDuration] = useState<number | ''>('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [terms, setTerms] = useState('');
  const [platformSpec, setPlatformSpec] = useState({ channel: '', placement: '', proof: '', timing: '' });

  const update = <K extends keyof CreatePromotionRequest>(k: K, v: CreatePromotionRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const toggleMulti = <T extends string>(
    key: keyof CreatePromotionRequest,
    current: T[],
    value: T
  ) => {
    update(
      key,
      current.includes(value) ? current.filter((x) => x !== value) : [...current, value]
    );
  };

  const completion = useMemo(() => {
    const checks = [
      form.title.trim(),
      form.short_description.trim(),
      form.description.trim(),
      (form.audience_niches ?? []).length > 0,
      (form.content_formats ?? []).length > 0,
      normalise(regions).length > 0,
      normalise(deliverables).length > 0,
      requirementAction.trim(),
      terms.trim(),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, regions, deliverables, requirementAction, terms]);

  const specLabels = PLATFORM_SPECIFIC_LABELS[form.platform] ?? {
    channel: 'Channel or account',
    placement: 'Placement context',
    proof: 'Proof expectation',
    timing: 'Timing window',
  };

  const guidance =
    TYPE_GUIDANCE[form.type] ||
    PLATFORM_GUIDANCE[form.platform] ||
    'Keep the promise clear, platform-specific, and measurable for the buyer.';

  const isDisabled = create.isPending || !form.title.trim() || !form.short_description.trim() || !form.description.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hashtags = hashtagInput
      .split(',')
      .map((v) => v.trim().replace(/^#/, ''))
      .filter(Boolean);

    const payload: CreatePromotionRequest = {
      ...form,
      title: form.title.trim(),
      short_description: form.short_description.trim(),
      description: form.description.trim(),
      audience_regions: normalise(regions),
      deliverables: normalise(deliverables),
      terms: terms.trim() || undefined,
      featured_image: form.featured_image?.trim() || undefined,
      platform_specifics: Object.values(platformSpec).some((v) => v.trim())
        ? {
            channel: platformSpec.channel.trim() || undefined,
            placement: platformSpec.placement.trim() || undefined,
            proof: platformSpec.proof.trim() || undefined,
            timing: platformSpec.timing.trim() || undefined,
          }
        : undefined,
      requirements: requirementAction.trim()
        ? {
            action: requirementAction.trim(),
            duration_hours: requirementDuration === '' ? undefined : requirementDuration,
            hashtags: hashtags.length ? hashtags : undefined,
          }
        : undefined,
    };

    create.mutate(payload, {
      onSuccess: () => {
        toast.success('Service created');
        router.push('/artist/promotions');
      },
      onError: (err: Error) => toast.error(err.message || 'Failed to create service'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/artist/promotions"
          className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Service</h1>
          <p className="text-sm text-muted-foreground">
            Package your promotion into a listing artists can discover and book
          </p>
        </div>
      </div>

      {/* Completion banner */}
      <div className="flex items-center gap-4 rounded-xl bg-card px-5 py-3.5 shadow-sm">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium">Listing completeness</span>
            <span className="text-muted-foreground">{completion}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-md',
            completion >= 80
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {completion >= 80 ? 'Ready to publish' : 'Keep going'}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Offer identity */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
                <Megaphone className="h-3.5 w-3.5 text-violet-500" />
              </span>
              <h2 className="font-semibold">Offer Identity</h2>
            </div>

            <div>
              <label className={labelCls}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                className={inputCls}
                placeholder="e.g. TikTok launch boost for Afrobeats singles"
                required
              />
            </div>

            <div>
              <label className={labelCls}>Short description *</label>
              <input
                type="text"
                value={form.short_description}
                onChange={(e) => update('short_description', e.target.value)}
                className={inputCls}
                placeholder="One-line summary of the outcome"
                maxLength={255}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Full description *</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className={textareaCls}
                rows={5}
                placeholder="How does it work? What does the artist send? How is delivery verified?"
                required
              />
            </div>

            <ImageUploadInput
              label="Featured Image"
              value={form.featured_image}
              onChange={(url) => update('featured_image', url ?? undefined)}
              uploadType="cover"
              aspectRatio="video"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Promotion type</label>
                <select
                  value={form.type}
                  onChange={(e) => update('type', e.target.value as PromotionType)}
                  className={inputCls}
                >
                  {Object.entries(PROMOTION_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => update('platform', e.target.value as PromotionPlatform)}
                  className={inputCls}
                >
                  {Object.entries(PROMOTION_PLATFORM_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
              </span>
              <h2 className="font-semibold">Pricing & Payment</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Price in credits</label>
                <input
                  type="number"
                  value={form.price_credits}
                  onChange={(e) => update('price_credits', Number(e.target.value))}
                  min={100}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Price in UGX</label>
                <input
                  type="number"
                  value={form.price_ugx}
                  onChange={(e) => update('price_ugx', Number(e.target.value))}
                  min={1000}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Accepted payment methods</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { key: 'accepts_credits' as const, label: 'Credits' },
                  { key: 'accepts_ugx' as const, label: 'UGX Wallet' },
                  { key: 'accepts_hybrid' as const, label: 'Hybrid' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update(key, !form[key])}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      form[key]
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Audience & delivery */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/40">
                <Target className="h-3.5 w-3.5 text-sky-500" />
              </span>
              <h2 className="font-semibold">Audience & Delivery</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Estimated reach</label>
                <input
                  type="number"
                  value={form.estimated_reach}
                  onChange={(e) => update('estimated_reach', Number(e.target.value))}
                  min={1}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Min delivery days</label>
                <input
                  type="number"
                  value={form.delivery_days_min}
                  onChange={(e) => update('delivery_days_min', Number(e.target.value))}
                  min={1}
                  max={30}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Max delivery days</label>
                <input
                  type="number"
                  value={form.delivery_days_max}
                  onChange={(e) => update('delivery_days_max', Number(e.target.value))}
                  min={form.delivery_days_min}
                  max={30}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Audience niches</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {Object.entries(PROMOTION_AUDIENCE_NICHE_LABELS).map(([v, l]) => {
                    const on = (form.audience_niches ?? []).includes(v as PromotionAudienceNiche);
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => toggleMulti('audience_niches', form.audience_niches ?? [], v as PromotionAudienceNiche)}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                          on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelCls}>Content formats</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {Object.entries(PROMOTION_CONTENT_FORMAT_LABELS).map(([v, l]) => {
                    const on = (form.content_formats ?? []).includes(v as PromotionContentFormat);
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => toggleMulti('content_formats', form.content_formats ?? [], v as PromotionContentFormat)}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                          on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls.replace('mb-1.5', '')}>Audience regions</label>
                <button
                  type="button"
                  onClick={() => addItem(regions, setRegions)}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {regions.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem(regions, setRegions, i, e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Kampala, East Africa, diaspora"
                    />
                    {regions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(regions, setRegions, i)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Platform specifics */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/40">
                <Radio className="h-3.5 w-3.5 text-orange-500" />
              </span>
              <h2 className="font-semibold">Platform Specifics</h2>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Channel-level clarity helps artists and admins understand your offer before booking.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { field: 'channel' as const, label: specLabels.channel, placeholder: 'e.g. Teso FM Drive Time, @nina.waves' },
                { field: 'placement' as const, label: specLabels.placement, placeholder: 'e.g. story + reel, drive time spin' },
                { field: 'proof' as const, label: specLabels.proof, placeholder: 'e.g. station log + recorded clip' },
                { field: 'timing' as const, label: specLabels.timing, placeholder: 'e.g. within 48h, weekend slot' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <input
                    type="text"
                    value={platformSpec[field]}
                    onChange={(e) => setPlatformSpec((p) => ({ ...p, [field]: e.target.value }))}
                    className={inputCls}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Requirements & deliverables */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
                <Ticket className="h-3.5 w-3.5 text-amber-500" />
              </span>
              <h2 className="font-semibold">Requirements & Deliverables</h2>
            </div>

            <div>
              <label className={labelCls}>What the artist needs to provide</label>
              <input
                type="text"
                value={requirementAction}
                onChange={(e) => setRequirementAction(e.target.value)}
                className={inputCls}
                placeholder="e.g. Share the song link, snippet, and 3 campaign hashtags"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Duration in hours (optional)</label>
                <input
                  type="number"
                  value={requirementDuration}
                  onChange={(e) =>
                    setRequirementDuration(e.target.value ? Number(e.target.value) : '')
                  }
                  min={1}
                  className={inputCls}
                  placeholder="24"
                />
              </div>
              <div>
                <label className={labelCls}>Suggested hashtags</label>
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  className={inputCls}
                  placeholder="tesotunes, afrobeats, newmusic"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls.replace('mb-1.5', '')}>Deliverables</label>
                <button
                  type="button"
                  onClick={() => addItem(deliverables, setDeliverables)}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {deliverables.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem(deliverables, setDeliverables, i, e.target.value)}
                      className={inputCls}
                      placeholder="e.g. 1 TikTok post, 2 story reposts, screenshot proof"
                    />
                    {deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(deliverables, setDeliverables, i)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Terms & conditions</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className={textareaCls}
                rows={4}
                placeholder="Revision rules, prohibited content, rescheduling, brand-safety limits…"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isDisabled}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Create Service
            </button>
            <Link
              href="/artist/promotions"
              className="flex items-center rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Right sidebar */}
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          {/* Live preview */}
          <div className="rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="bg-muted/40 px-5 py-3 border-b">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Buyer Preview
              </p>
            </div>
            <div className="p-5">
              <p className="text-xs font-medium text-primary mb-1">
                {PROMOTION_TYPE_LABELS[form.type]}
              </p>
              <h3 className="font-semibold leading-snug">
                {form.title || <span className="text-muted-foreground italic">Your title here…</span>}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                {form.short_description || 'Short description will appear here'}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold text-sm">{formatNumber(form.price_credits)} cr</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(form.price_ugx)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-xs text-muted-foreground">Reach</p>
                  <p className="font-semibold text-sm">{formatNumber(form.estimated_reach)}</p>
                  <p className="text-xs text-muted-foreground">estimated</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                  {PROMOTION_PLATFORM_LABELS[form.platform]}
                </span>
                {(form.audience_niches ?? []).slice(0, 2).map((n) => (
                  <span key={n} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                    {PROMOTION_AUDIENCE_NICHE_LABELS[n]}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {form.delivery_days_min === form.delivery_days_max
                  ? `${form.delivery_days_min}d delivery`
                  : `${form.delivery_days_min}–${form.delivery_days_max}d delivery`}
              </div>
            </div>
          </div>

          {/* Guidance */}
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Listing Guidance</h3>
            <div className="space-y-3">
              {[
                { icon: BadgeCheck, text: guidance, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/40' },
                { icon: Users, text: 'Specific audience niches, regions, and formats convert better than generic listings.', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40' },
                { icon: Star, text: 'Clear deliverables remove pre-sale hesitation and reduce dispute risk.', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
              ].map(({ icon: Icon, text, color, bg }) => (
                <div key={text} className="flex gap-2.5">
                  <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md mt-0.5', bg)}>
                    <Icon className={cn('h-3.5 w-3.5', color)} />
                  </span>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
