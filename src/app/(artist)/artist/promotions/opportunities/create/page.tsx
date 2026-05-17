'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Coins,
  Loader2,
  Megaphone,
  Music,
  Plus,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateOpportunity } from '@/hooks/usePromotionsV2';
import { useMyArtistSongs } from '@/hooks/useArtist';
import type { PromotableType } from '@/types/promotions-v2';

const PLATFORMS = [
  'TikTok', 'Instagram', 'YouTube', 'Facebook', 'Twitter',
  'Radio', 'Blog', 'Club / DJ', 'Spotify', 'WhatsApp',
];

const NICHES = [
  'Afrobeats', 'Gospel', 'Hip-Hop', 'R&B', 'Dancehall',
  'Pop', 'Traditional', 'Jazz', 'Reggae', 'Electronic',
];

const REGIONS = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'East Africa',
  'Nigeria', 'Ghana', 'South Africa', 'Global',
];

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

interface SongOption {
  id: number;
  title: string;
  artwork_url?: string | null;
}

export default function PostOpportunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createOpp = useCreateOpportunity();

  const prefillType = (searchParams.get('promotable_type') ?? 'song') as PromotableType;
  const prefillId = searchParams.get('promotable_id') ? Number(searchParams.get('promotable_id')) : null;
  const prefillTitle = searchParams.get('promotable_title') ?? '';

  const { data: songsData } = useMyArtistSongs({ per_page: 50, status: 'published' });
  const songs: SongOption[] = (songsData?.data ?? []).map((s: { id: number; title: string; artwork_url?: string | null }) => ({
    id: s.id,
    title: s.title,
    artwork_url: s.artwork_url,
  }));

  const [form, setForm] = useState({
    promotable_type: prefillType,
    promotable_id: prefillId ?? 0,
    promotable_title: prefillTitle,
    title: '',
    brief: '',
    target_platforms: [] as string[],
    target_audience_niches: [] as string[],
    target_regions: [] as string[],
    budget_min_ugx: 50000,
    budget_max_ugx: 200000,
    budget_credits: 0,
    deadline_at: '',
    deliverables: [''] as string[],
  });

  // Pre-select song if pre-fill but no songs loaded yet
  useEffect(() => {
    if (prefillId && form.promotable_id === 0) {
      setForm((f) => ({ ...f, promotable_id: prefillId, promotable_title: prefillTitle }));
    }
  }, [prefillId, prefillTitle, form.promotable_id]);

  const update = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addDeliverable = () => update('deliverables', [...form.deliverables, '']);
  const removeDeliverable = (i: number) =>
    update('deliverables', form.deliverables.filter((_, idx) => idx !== i));
  const updateDeliverable = (i: number, v: string) => {
    const next = [...form.deliverables];
    next[i] = v;
    update('deliverables', next);
  };

  const isValid =
    form.promotable_id > 0 &&
    form.title.trim().length >= 5 &&
    form.target_platforms.length > 0 &&
    form.budget_min_ugx > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    createOpp.mutate(
      {
        promotable_type: form.promotable_type,
        promotable_id: form.promotable_id,
        title: form.title.trim(),
        brief: form.brief.trim() || undefined,
        target_platforms: form.target_platforms.map((p) => p.toLowerCase().replace(/[\s/]+/g, '_')),
        target_audience_niches: form.target_audience_niches.map((n) => n.toLowerCase().replace(/[\s/]+/g, '-')),
        target_regions: form.target_regions,
        budget_min_ugx: form.budget_min_ugx,
        budget_max_ugx: form.budget_max_ugx,
        budget_credits: form.budget_credits || undefined,
        deadline_at: form.deadline_at || undefined,
        deliverables: form.deliverables.filter((d) => d.trim()),
      },
      {
        onSuccess: () => router.push('/promotions/opportunities'),
      }
    );
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
          <h1 className="text-2xl font-bold tracking-tight">Post a promotion opportunity</h1>
          <p className="text-sm text-muted-foreground">
            Tell promoters what you need — they apply, you pick the best fit.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main form */}
        <div className="space-y-5">
          {/* Song selection */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
                <Music className="h-3.5 w-3.5 text-violet-500" />
              </span>
              <h2 className="font-semibold">Select a song to promote</h2>
            </div>

            {songs.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {songs.map((song) => {
                  const selected = form.promotable_id === song.id;
                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, promotable_id: song.id, promotable_title: song.title }))}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-3 text-left transition-all',
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30 hover:bg-muted/30'
                      )}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {song.artwork_url && (
                          <img src={song.artwork_url} alt={song.title} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className={cn('truncate text-sm font-medium', selected ? 'text-primary' : '')}>
                        {song.title}
                      </span>
                      {selected && <BadgeCheck className="ml-auto h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </div>
            ) : prefillId ? (
              <div className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-3">
                <Music className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium text-primary">{prefillTitle || `Song #${prefillId}`}</span>
                <BadgeCheck className="ml-auto h-4 w-4 text-primary" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No published songs found.{' '}
                <Link href="/artist/songs" className="text-primary underline">Upload a song first</Link>.
              </p>
            )}
          </div>

          {/* Opportunity details */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/40">
                <Megaphone className="h-3.5 w-3.5 text-sky-500" />
              </span>
              <h2 className="font-semibold">Opportunity details</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="e.g. Looking for TikTok creator to promote my Gospel track"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Brief / description</label>
              <textarea
                value={form.brief}
                onChange={(e) => update('brief', e.target.value)}
                placeholder="Describe what you're looking for — style, tone, audience, format..."
                rows={3}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>

          {/* Target */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                <Target className="h-3.5 w-3.5 text-emerald-500" />
              </span>
              <h2 className="font-semibold">Target audience & platforms</h2>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Platforms <span className="text-destructive">*</span></p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const active = form.target_platforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => update('target_platforms', toggle(form.target_platforms, p))}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/60'
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Music niches</p>
              <div className="flex flex-wrap gap-2">
                {NICHES.map((n) => {
                  const active = form.target_audience_niches.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => update('target_audience_niches', toggle(form.target_audience_niches, n))}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                        active ? 'bg-sky-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/60'
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Target regions</p>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => {
                  const active = form.target_regions.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => update('target_regions', toggle(form.target_regions, r))}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                        active ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/60'
                      )}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
                <Coins className="h-3.5 w-3.5 text-amber-500" />
              </span>
              <h2 className="font-semibold">Budget & deadline</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Min budget (UGX)</label>
                <input
                  type="number"
                  min={0}
                  value={form.budget_min_ugx}
                  onChange={(e) => update('budget_min_ugx', Number(e.target.value))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Max budget (UGX)</label>
                <input
                  type="number"
                  min={0}
                  value={form.budget_max_ugx}
                  onChange={(e) => update('budget_max_ugx', Number(e.target.value))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Credits budget (cr)</label>
                <input
                  type="number"
                  min={0}
                  value={form.budget_credits}
                  onChange={(e) => update('budget_credits', Number(e.target.value))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={form.deadline_at}
                    onChange={(e) => update('deadline_at', e.target.value)}
                    className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40">
                <BadgeCheck className="h-3.5 w-3.5 text-rose-500" />
              </span>
              <h2 className="font-semibold">Deliverables</h2>
            </div>
            <p className="text-xs text-muted-foreground">What do you expect the promoter to deliver?</p>

            <div className="space-y-2">
              {form.deliverables.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={d}
                    onChange={(e) => updateDeliverable(i, e.target.value)}
                    placeholder={`Deliverable ${i + 1}...`}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {form.deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDeliverable(i)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDeliverable}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Add deliverable
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Submit */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
            <h3 className="font-semibold">Ready to post?</h3>

            <div className="space-y-2 text-sm">
              <div className={cn('flex items-center gap-2', form.promotable_id > 0 ? 'text-emerald-500' : 'text-muted-foreground')}>
                <BadgeCheck className="h-4 w-4 shrink-0" />
                Song selected
              </div>
              <div className={cn('flex items-center gap-2', form.title.trim().length >= 5 ? 'text-emerald-500' : 'text-muted-foreground')}>
                <BadgeCheck className="h-4 w-4 shrink-0" />
                Title entered
              </div>
              <div className={cn('flex items-center gap-2', form.target_platforms.length > 0 ? 'text-emerald-500' : 'text-muted-foreground')}>
                <BadgeCheck className="h-4 w-4 shrink-0" />
                Platforms selected
              </div>
              <div className={cn('flex items-center gap-2', form.budget_min_ugx > 0 ? 'text-emerald-500' : 'text-muted-foreground')}>
                <BadgeCheck className="h-4 w-4 shrink-0" />
                Budget set
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || createOpp.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {createOpp.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createOpp.isPending ? 'Posting…' : 'Post opportunity'}
            </button>

            <Link
              href="/promotions/opportunities"
              className="block text-center text-xs text-muted-foreground hover:text-foreground underline"
            >
              View all opportunities
            </Link>
          </div>

          {/* How it works */}
          <div className="rounded-xl bg-card shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold">How opportunities work</h3>
            {[
              { step: '1', text: 'You post what you need and set a budget range' },
              { step: '2', text: 'Promoters browse and apply with their pitch' },
              { step: '3', text: 'You review applications and award the best fit' },
              { step: '4', text: 'Promoter delivers — you verify and release payment' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950/40 text-[10px] font-bold text-violet-500">
                  {step}
                </span>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
