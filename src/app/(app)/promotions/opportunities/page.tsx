'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BadgeCheck,
  Calendar,
  ChevronRight,
  Coins,
  Loader2,
  Megaphone,
  Music,
  Target,
  Users,
  XCircle,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { useOpportunitiesV2, useApplyToOpportunity } from '@/hooks/usePromotionsV2';
import { OPPORTUNITY_STATUS_LABELS } from '@/types/promotions-v2';
import type { PromotionOpportunityV2 } from '@/types/promotions-v2';
import { toast } from 'sonner';

const PLATFORMS = [
  { value: '', label: 'All' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'radio', label: 'Radio' },
  { value: 'club', label: 'Club / DJ' },
  { value: 'blog', label: 'Blog / Press' },
];

const STATUS_COLOR: Record<string, string> = {
  open: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
  reviewing: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  awarded: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
  closed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-muted text-muted-foreground',
  draft: 'bg-muted text-muted-foreground',
};

function OpportunityCard({ opp }: { opp: PromotionOpportunityV2 }) {
  const [showApply, setShowApply] = useState(false);
  const [pitch, setPitch] = useState('');
  const [priceUgx, setPriceUgx] = useState('');
  const [priceCredits, setPriceCredits] = useState('');
  const [timelineDays, setTimelineDays] = useState('');
  const apply = useApplyToOpportunity(opp.uuid);

  const handleApply = () => {
    apply.mutate(
      {
        pitch_message: pitch.trim() || undefined,
        proposed_price_ugx: priceUgx ? Number(priceUgx) : undefined,
        proposed_price_credits: priceCredits ? Number(priceCredits) : undefined,
        proposed_timeline_days: timelineDays ? Number(timelineDays) : undefined,
      },
      {
        onSuccess: () => {
          setShowApply(false);
          toast.success('Application submitted!');
        },
      }
    );
  };

  const platforms = opp.target_platforms ?? [];
  const niches = opp.target_audience_niches ?? [];
  const deadline = opp.deadline_at ? new Date(opp.deadline_at) : null;
  const daysLeft = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {opp.promotable?.artwork_url ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={opp.promotable.artwork_url} alt={opp.promotable.title ?? ''} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
                <Music className="h-5 w-5 text-violet-500" />
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-semibold leading-snug line-clamp-2">{opp.title}</h3>
              {opp.promotable && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {opp.promotable.title ?? opp.promotable.name ?? 'Track'} · {opp.promotable.artist?.name ?? ''}
                </p>
              )}
            </div>
          </div>

          <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold', STATUS_COLOR[opp.status] ?? STATUS_COLOR.closed)}>
            {OPPORTUNITY_STATUS_LABELS[opp.status]}
          </span>
        </div>

        {opp.brief && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{opp.brief}</p>
        )}

        {/* Budget */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            {formatCurrency(opp.budget_min_ugx)} – {formatCurrency(opp.budget_max_ugx)} UGX
          </span>
          {opp.budget_credits > 0 && (
            <span className="text-xs text-muted-foreground">
              or {formatNumber(opp.budget_credits)} credits
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {platforms.slice(0, 4).map((p) => (
            <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
              {p.replace(/_/g, ' ')}
            </span>
          ))}
          {niches.slice(0, 3).map((n) => (
            <span key={n} className="rounded-full bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-400 capitalize">
              {n}
            </span>
          ))}
        </div>

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {opp.application_count} applied
            </span>
            {daysLeft !== null && daysLeft > 0 && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {daysLeft}d left
              </span>
            )}
            {daysLeft !== null && daysLeft <= 0 && (
              <span className="text-destructive">Deadline passed</span>
            )}
          </div>

          {opp.status === 'open' && (
            <button
              type="button"
              onClick={() => setShowApply((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Apply
              <ChevronRight className={cn('h-3 w-3 transition-transform', showApply && 'rotate-90')} />
            </button>
          )}
        </div>
      </div>

      {/* Apply panel */}
      {showApply && (
        <div className="border-t bg-muted/30 p-5 space-y-3">
          <h4 className="text-sm font-semibold">Submit your application</h4>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Proposed price (UGX)</label>
              <input
                type="number"
                min={0}
                value={priceUgx}
                onChange={(e) => setPriceUgx(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Proposed price (credits)</label>
              <input
                type="number"
                min={0}
                value={priceCredits}
                onChange={(e) => setPriceCredits(e.target.value)}
                placeholder="e.g. 500"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Timeline (days)</label>
              <input
                type="number"
                min={1}
                value={timelineDays}
                onChange={(e) => setTimelineDays(e.target.value)}
                placeholder="e.g. 3"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Pitch message</label>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Tell the artist why you're the right fit for this opportunity..."
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowApply(false)}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={apply.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {apply.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Submit application
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OpportunitiesPage() {
  const [platform, setPlatform] = useState('');
  const [niche, setNiche] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useOpportunitiesV2({
    platform: platform || undefined,
    niche: niche || undefined,
    per_page: 12,
    page,
  });

  const opportunities = data?.data ?? [];
  const lastPage = (data as unknown as { last_page?: number })?.last_page ?? 1;

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-card shadow-sm p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
                <Target className="h-4 w-4 text-violet-500" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Promotion Opportunities</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Artists are looking for promoters. Browse open briefs and apply to the ones that match your audience.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/promoters"
              className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Find promoters
            </Link>
            <Link
              href="/artist/promotions/opportunities/create"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Post opportunity
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-card shadow-sm p-5 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Filter by platform</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => { setPlatform(p.value); setPage(1); }}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                platform === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-card shadow-sm py-16 text-center">
          <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive/40" />
          <p className="font-medium">Could not load opportunities</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
            Retry
          </button>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="rounded-xl bg-card shadow-sm py-16 text-center">
          <Megaphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">No open opportunities right now</p>
          <p className="mt-1 text-sm text-muted-foreground">Be the first to post one for your track</p>
          <Link
            href="/artist/promotions/opportunities/create"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Post an opportunity
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">Page {page} of {lastPage}</span>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Promoter CTA */}
      <div className="rounded-xl bg-card shadow-sm p-5 flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
          <BadgeCheck className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Not a promoter yet?</p>
          <p className="text-xs text-muted-foreground">Set up your profile in 3 minutes and start applying today.</p>
        </div>
        <Link
          href="/become-promoter"
          className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}
