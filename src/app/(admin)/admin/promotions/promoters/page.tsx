'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  Loader2,
  Search,
  ShieldOff,
  Star,
  Users,
  XCircle,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import {
  useAdminPromotersV2,
  useAdminVerifyPromoter,
  useAdminUnverifyPromoter,
  useAdminSetPromoterTier,
} from '@/hooks/usePromotionsV2';
import { PROMOTER_TIER_LABELS } from '@/types/promotions-v2';
import type { PromoterTier } from '@/types/promotions-v2';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'suspended', label: 'Suspended' },
];

const TIER_TABS = [
  { value: '', label: 'All tiers' },
  { value: 'elite', label: 'Elite' },
  { value: 'established', label: 'Established' },
  { value: 'rising', label: 'Rising' },
  { value: 'starter', label: 'Starter' },
];

const TIER_COLORS: Record<PromoterTier, string> = {
  elite: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  established: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
  rising: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
  starter: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};

export default function AdminPromotersV2Page() {
  const [status, setStatus] = useState('');
  const [tier, setTier] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [settingTierId, setSettingTierId] = useState<number | null>(null);

  const { data, isLoading, isError } = useAdminPromotersV2({
    status: status || undefined,
    tier: (tier as PromoterTier) || undefined,
    search: search || undefined,
    page,
    per_page: 20,
  });

  const verify = useAdminVerifyPromoter();
  const unverify = useAdminUnverifyPromoter();
  const setTierMutation = useAdminSetPromoterTier();

  const promoters = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/promotions"
            className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Promoter Profiles</h1>
            <p className="text-sm text-muted-foreground">
              Verify influencers, adjust tiers, and manage V2 promoter accounts
            </p>
          </div>
        </div>
        <Link
          href="/admin/promotions/opportunities"
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Opportunities
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total promoters', value: formatNumber(total), icon: Users },
          { label: 'Showing', value: formatNumber(promoters.length), icon: Users },
          { label: 'Verified', value: formatNumber(promoters.filter(p => p.is_verified).length), icon: BadgeCheck },
          { label: 'Avg rating', value: promoters.length ? (promoters.reduce((s, p) => s + parseFloat(String(p.average_rating ?? 0)), 0) / promoters.length).toFixed(1) : '—', icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl bg-card shadow-sm p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-card shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by display name, username, or email..."
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(1); }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                status === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </button>
          ))}
          <span className="mx-1 self-center text-muted-foreground">·</span>
          {TIER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setTier(tab.value); setPage(1); }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                tier === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-card shadow-sm py-16 text-center">
          <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive/40" />
          <p className="font-medium">Could not load promoters</p>
        </div>
      ) : promoters.length === 0 ? (
        <div className="rounded-xl bg-card shadow-sm py-16 text-center text-muted-foreground">
          No promoter profiles match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {promoters.map((promoter) => (
            <div key={promoter.id} className="rounded-xl bg-card shadow-sm p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4 min-w-0">
                  {/* Avatar */}
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    {promoter.user?.avatar_url ? (
                      <img src={promoter.user.avatar_url} alt={promoter.display_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                        {promoter.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{promoter.display_name}</h3>
                      {promoter.is_verified && (
                        <BadgeCheck className="h-4 w-4 text-blue-500" />
                      )}
                      <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', TIER_COLORS[promoter.tier])}>
                        {PROMOTER_TIER_LABELS[promoter.tier]}
                      </span>
                      <span className={cn(
                        'rounded-full border px-2 py-0.5 text-xs font-medium',
                        promoter.status === 'active'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : promoter.status === 'suspended'
                          ? 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300'
                          : 'border-border bg-muted text-muted-foreground'
                      )}>
                        {promoter.status}
                      </span>
                    </div>

                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {promoter.user?.name} · @{promoter.user?.username ?? promoter.slug} · {promoter.user?.email}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{formatNumber(promoter.total_listings)} listings</span>
                      <span>{formatNumber(promoter.total_completed_orders)} orders</span>
                      {promoter.average_rating && <span>★ {parseFloat(String(promoter.average_rating)).toFixed(1)}</span>}
                      {promoter.platforms?.slice(0, 3).map(p => (
                        <span key={p} className="rounded-full bg-muted px-2 py-0.5 capitalize">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  {/* Verify / Unverify */}
                  {promoter.is_verified ? (
                    <button
                      onClick={() => unverify.mutate(promoter.id)}
                      disabled={unverify.isPending}
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
                    >
                      <ShieldOff className="h-3.5 w-3.5" />
                      Remove verification
                    </button>
                  ) : (
                    <button
                      onClick={() => verify.mutate(promoter.id)}
                      disabled={verify.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 disabled:opacity-60"
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verify
                    </button>
                  )}

                  {/* Tier selector */}
                  {settingTierId === promoter.id ? (
                    <div className="flex items-center gap-1">
                      {(['starter', 'rising', 'established', 'elite'] as PromoterTier[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setTierMutation.mutate({ id: promoter.id, tier: t }, {
                              onSuccess: () => setSettingTierId(null),
                            });
                          }}
                          disabled={setTierMutation.isPending}
                          className={cn(
                            'rounded-lg border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60',
                            promoter.tier === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                          )}
                        >
                          {PROMOTER_TIER_LABELS[t]}
                        </button>
                      ))}
                      <button
                        onClick={() => setSettingTierId(null)}
                        className="ml-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSettingTierId(promoter.id)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      Set tier
                    </button>
                  )}

                  <Link
                    href={`/promoters/${promoter.slug}`}
                    target="_blank"
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    Public profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
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
    </div>
  );
}
