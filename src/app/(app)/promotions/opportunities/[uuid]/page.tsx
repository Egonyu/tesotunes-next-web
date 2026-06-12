'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Clock,
  Coins,
  Eye,
  Loader2,
  Music,
  Target,
  Users,
  XCircle,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { useOpportunityV2, useApplyToOpportunity } from '@/hooks/usePromotionsV2';
import { OPPORTUNITY_STATUS_LABELS } from '@/types/promotions-v2';

const STATUS_COLOR: Record<string, string> = {
  open: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  reviewing: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  awarded: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  closed: 'border-border bg-muted text-muted-foreground',
  cancelled: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
  draft: 'border-border bg-muted text-muted-foreground',
};

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function OpportunityDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: opp, isLoading, isError } = useOpportunityV2(uuid);

  const [pitch, setPitch] = useState('');
  const [priceUgx, setPriceUgx] = useState('');
  const [priceCredits, setPriceCredits] = useState('');
  const [timelineDays, setTimelineDays] = useState('');
  const [showForm, setShowForm] = useState(false);

  const apply = useApplyToOpportunity(uuid);

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
          setShowForm(false);
          setPitch('');
          setPriceUgx('');
          setPriceCredits('');
          setTimelineDays('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !opp) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive/40" />
        <p className="font-medium">Could not load this opportunity.</p>
        <Link href="/promotions/opportunities" className="mt-4 inline-block rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
          Back to opportunities
        </Link>
      </div>
    );
  }

  const days = daysUntil(opp.deadline_at);
  const platforms = opp.target_platforms ?? [];
  const niches = opp.target_audience_niches ?? [];
  const regions = opp.target_regions ?? [];
  const deliverables = opp.deliverables ?? [];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-5">
      {/* Back nav */}
      <Link
        href="/promotions/opportunities"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All opportunities
      </Link>

      {/* Header card */}
      <div className="rounded-xl bg-card shadow-sm p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            {opp.promotable?.artwork_url ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={opp.promotable.artwork_url}
                  alt={opp.promotable.title ?? ''}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40">
                <Music className="h-7 w-7 text-violet-500" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium', STATUS_COLOR[opp.status] ?? STATUS_COLOR.closed)}>
                  {OPPORTUNITY_STATUS_LABELS[opp.status] ?? opp.status}
                </span>
                {opp.promotable && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {opp.promotable.type ?? 'content'}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold leading-snug">{opp.title}</h1>
              {opp.promotable && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {opp.promotable.title ?? opp.promotable.name ?? 'Track'}
                  {opp.promotable.artist && ` · ${opp.promotable.artist.name}`}
                </p>
              )}
            </div>
          </div>

          {opp.status === 'open' && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Apply now
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {formatNumber(opp.view_count)} views
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {formatNumber(opp.application_count)} applications
          </span>
          {days !== null && (
            <span className={cn('flex items-center gap-1.5', days < 3 ? 'text-red-500' : '')}>
              <Clock className="h-3.5 w-3.5" />
              {days > 0 ? `${days} days remaining` : 'Deadline passed'}
            </span>
          )}
          {opp.deadline_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Due {new Date(opp.deadline_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Budget card */}
      <div className="rounded-xl bg-card shadow-sm p-5">
        <h2 className="text-sm font-semibold mb-3">Budget</h2>
        <div className="flex flex-wrap gap-4">
          {(opp.budget_min_ugx > 0 || opp.budget_max_ugx > 0) && (
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="font-medium">
                {formatCurrency(opp.budget_min_ugx)} – {formatCurrency(opp.budget_max_ugx)} UGX
              </span>
            </div>
          )}
          {opp.budget_credits > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{formatNumber(opp.budget_credits)} credits</span>
            </div>
          )}
        </div>
      </div>

      {/* Brief & details */}
      {(opp.brief || deliverables.length > 0) && (
        <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
          {opp.brief && (
            <div>
              <h2 className="text-sm font-semibold mb-2">Brief</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{opp.brief}</p>
            </div>
          )}
          {deliverables.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-2">Deliverables</h2>
              <ul className="space-y-1">
                {deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {(platforms.length > 0 || niches.length > 0 || regions.length > 0) && (
        <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
          {platforms.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Target platforms</h2>
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <span key={p} className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">{p.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
          )}
          {niches.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Audience niches</h2>
              <div className="flex flex-wrap gap-1.5">
                {niches.map((n) => (
                  <span key={n} className="rounded-full bg-violet-50 dark:bg-violet-950/30 px-3 py-1 text-xs font-medium capitalize text-violet-600 dark:text-violet-400">{n}</span>
                ))}
              </div>
            </div>
          )}
          {regions.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Target regions</h2>
              <div className="flex flex-wrap gap-1.5">
                {regions.map((r) => (
                  <span key={r} className="rounded-full bg-sky-50 dark:bg-sky-950/30 px-3 py-1 text-xs font-medium capitalize text-sky-600 dark:text-sky-400">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apply form */}
      {opp.status === 'open' && showForm && (
        <div className="rounded-xl bg-card shadow-sm p-6 space-y-4">
          <h2 className="font-semibold">Submit your application</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Price (UGX)</label>
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
              <label className="text-xs font-medium text-muted-foreground">Price (credits)</label>
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
                placeholder="e.g. 7"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Pitch message</label>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Tell the artist why you're the right promoter for this opportunity — your reach, past campaigns, platforms..."
              rows={4}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={apply.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {apply.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Submit application
            </button>
          </div>
        </div>
      )}

      {/* Not-a-promoter CTA */}
      {opp.status === 'open' && (
        <div className="rounded-xl bg-card shadow-sm p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
            <BadgeCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">New to promoting?</p>
            <p className="text-xs text-muted-foreground">Set up your promoter profile in 3 minutes and apply to opportunities.</p>
          </div>
          <Link
            href="/become-promoter"
            className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Get started
          </Link>
        </div>
      )}
    </div>
  );
}
