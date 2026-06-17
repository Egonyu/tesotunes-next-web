'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BadgeCheck,
  Loader2,
  Megaphone,
  Search,
  Star,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { usePromotersV2 } from '@/hooks/usePromotionsV2';
import type { PromoterTier } from '@/types/promotions-v2';
import { PROMOTER_TIER_LABELS } from '@/types/promotions-v2';

const PLATFORMS = [
  { value: '', label: 'All Platforms' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'radio', label: 'Radio' },
  { value: 'club', label: 'Club / DJ' },
  { value: 'blog', label: 'Blog / Press' },
];

const NICHES = [
  { value: '', label: 'All Niches' },
  { value: 'afrobeats', label: 'Afrobeats' },
  { value: 'gospel', label: 'Gospel' },
  { value: 'hiphop', label: 'Hip-Hop' },
  { value: 'rnb', label: 'R&B' },
  { value: 'dancehall', label: 'Dancehall' },
  { value: 'pop', label: 'Pop' },
  { value: 'traditional', label: 'Traditional' },
];

const TIERS: { value: PromoterTier | ''; label: string }[] = [
  { value: '', label: 'All Tiers' },
  { value: 'elite', label: 'Elite' },
  { value: 'established', label: 'Established' },
  { value: 'rising', label: 'Rising' },
  { value: 'starter', label: 'Starter' },
];

const TIER_COLORS: Record<PromoterTier, { bg: string; text: string; border: string }> = {
  elite: { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  established: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' },
  rising: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  starter: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
};

export default function PromotersDiscoveryPage() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [niche, setNiche] = useState('');
  const [tier, setTier] = useState<PromoterTier | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = usePromotersV2({
    search: search || undefined,
    platform: platform || undefined,
    niche: niche || undefined,
    tier: tier || undefined,
    per_page: 18,
    page,
  });

  const promoters = data?.data ?? [];
  const meta = data as unknown as { current_page?: number; last_page?: number; total?: number } | undefined;
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? 0;

  return (
    <div className="container mx-auto max-w-7xl py-8 space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-card shadow-sm p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
                <Megaphone className="h-4 w-4 text-violet-500" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Find a Promoter</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Browse verified promoters by platform, niche, and tier. Post an opportunity or buy a service directly.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/promotions"
              className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Services marketplace
            </Link>
            <Link
              href="/promotions/opportunities"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse opportunities
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-card shadow-sm p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or keyword..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Platform */}
          <div className="flex flex-wrap gap-1.5">
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

        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Niche</p>
            <div className="flex flex-wrap gap-1.5">
              {NICHES.map((n) => (
                <button
                  key={n.value}
                  onClick={() => { setNiche(n.value); setPage(1); }}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    niche === n.value
                      ? 'bg-sky-500 text-white'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Tier</p>
            <div className="flex flex-wrap gap-1.5">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTier(t.value as PromoterTier | ''); setPage(1); }}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    tier === t.value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(search || platform || niche || tier) && (
          <button
            onClick={() => { setSearch(''); setPlatform(''); setNiche(''); setTier(''); setPage(1); }}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-card shadow-sm py-16 text-center">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive/40" />
            <p className="font-medium">Could not load promoters</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : promoters.length === 0 ? (
          <div className="rounded-xl bg-card shadow-sm py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">No promoters found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try different filters or be the first to join</p>
            <Link
              href="/become-promoter"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Become a promoter
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total > 0 ? `${formatNumber(total)} promoter${total === 1 ? '' : 's'}` : `${promoters.length} result${promoters.length === 1 ? '' : 's'}`}
              </p>
              <Link
                href="/become-promoter"
                className="text-xs font-medium text-primary hover:underline"
              >
                + Become a promoter
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {promoters.map((promoter) => {
                const tierColor = TIER_COLORS[promoter.tier] ?? TIER_COLORS.starter;
                const platforms = promoter.platforms ?? [];
                const niches = promoter.niches ?? [];
                const rating = promoter.average_rating ? parseFloat(promoter.average_rating) : null;

                return (
                  <Link
                    key={promoter.id}
                    href={`/promoters/${promoter.slug}`}
                    className="group block rounded-xl bg-card shadow-sm p-5 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {promoter.user?.avatar ? (
                          <Image
                            src={promoter.user.avatar}
                            alt={promoter.display_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                            {promoter.display_name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-semibold group-hover:text-primary transition-colors">
                            {promoter.display_name}
                          </p>
                          {promoter.is_verified && (
                            <BadgeCheck className="h-4 w-4 shrink-0 text-sky-500" />
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className={cn(
                            'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                            tierColor.bg, tierColor.text, tierColor.border
                          )}>
                            {PROMOTER_TIER_LABELS[promoter.tier]}
                          </span>
                          {rating !== null && (
                            <span className="flex items-center gap-0.5 text-xs text-amber-500">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {promoter.bio && (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {promoter.bio}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {platforms.slice(0, 3).map((p) => (
                        <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                          {p}
                        </span>
                      ))}
                      {niches.slice(0, 2).map((n) => (
                        <span key={n} className="rounded-full bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-400 capitalize">
                          {n}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3.5 w-3.5" />
                        {promoter.total_completed_orders} completed
                      </div>
                      {promoter.total_listings > 0 && (
                        <span className="text-xs font-medium text-primary">
                          {promoter.total_listings} service{promoter.total_listings !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {lastPage}
                </span>
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
      </div>

      {/* CTA */}
      <div className="rounded-xl bg-card shadow-sm p-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40">
          <Megaphone className="h-5 w-5 text-violet-500" />
        </div>
        <h3 className="font-semibold">Are you an influencer or content creator?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          List your services and earn UGX + credits promoting music. No artist role required.
        </p>
        <Link
          href="/become-promoter"
          className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Become a promoter
        </Link>
      </div>
    </div>
  );
}
