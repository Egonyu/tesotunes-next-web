'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Eye,
  Loader2,
  Search,
  Target,
  XCircle,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import {
  useAdminOpportunitiesV2,
  useAdminCloseOpportunity,
} from '@/hooks/usePromotionsV2';
import { OPPORTUNITY_STATUS_LABELS } from '@/types/promotions-v2';
import type { OpportunityStatus } from '@/types/promotions-v2';

const STATUS_TABS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<OpportunityStatus, string> = {
  open: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  reviewing: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  awarded: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  draft: 'border-border bg-muted text-muted-foreground',
  closed: 'border-border bg-muted text-muted-foreground',
  cancelled: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
};

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function AdminOpportunitiesPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminOpportunitiesV2({
    status: status || undefined,
    search: search || undefined,
    page,
    per_page: 20,
  });

  const close = useAdminCloseOpportunity();

  const opportunities = data?.data ?? [];
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
            <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
            <p className="text-sm text-muted-foreground">
              All artist-posted promotion briefs — oversee, close, and review applications
            </p>
          </div>
        </div>
        <Link
          href="/admin/promotions/promoters"
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Promoter profiles
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: formatNumber(total) },
          { label: 'Open', value: formatNumber(opportunities.filter(o => o.status === 'open').length) },
          { label: 'Total applications', value: formatNumber(opportunities.reduce((s, o) => s + o.application_count, 0)) },
          { label: 'Total views', value: formatNumber(opportunities.reduce((s, o) => s + o.view_count, 0)) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-card shadow-sm p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
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
            placeholder="Search by title or creator..."
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
          <p className="font-medium">Could not load opportunities</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="rounded-xl bg-card shadow-sm py-16 text-center text-muted-foreground">
          No opportunities match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => {
            const days = daysUntil(opp.deadline_at);
            return (
              <div key={opp.uuid} className="rounded-xl bg-card shadow-sm p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn(
                        'rounded-full border px-2 py-0.5 text-xs font-medium',
                        STATUS_COLORS[opp.status as OpportunityStatus] ?? 'border-border bg-muted text-muted-foreground'
                      )}>
                        {OPPORTUNITY_STATUS_LABELS[opp.status as OpportunityStatus] ?? opp.status}
                      </span>
                      {opp.promotable && (
                        <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground capitalize">
                          {opp.promotable.type?.toLowerCase() ?? 'content'} · {opp.promotable.title}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 font-semibold">{opp.title}</h3>
                    {opp.brief && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{opp.brief}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {formatNumber(opp.view_count)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" />
                        {formatNumber(opp.application_count)} applications
                      </span>
                      {days !== null && (
                        <span className={cn('flex items-center gap-1', days < 3 ? 'text-red-500' : '')}>
                          <Clock className="h-3.5 w-3.5" />
                          {days > 0 ? `${days}d remaining` : 'Deadline passed'}
                        </span>
                      )}
                      {(opp.budget_min_ugx > 0 || opp.budget_max_ugx > 0) && (
                        <span>
                          Budget: {formatCurrency(opp.budget_min_ugx)}–{formatCurrency(opp.budget_max_ugx)} UGX
                        </span>
                      )}
                    </div>

                    {opp.target_platforms && opp.target_platforms.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {opp.target_platforms.slice(0, 4).map(p => (
                          <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{p}</span>
                        ))}
                      </div>
                    )}

                    <p className="mt-2 text-xs text-muted-foreground">
                      Posted by <span className="font-medium">{opp.creator?.name ?? '—'}</span>
                      {opp.creator?.username && ` (@${opp.creator.username})`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 sm:w-44 sm:shrink-0">
                    <Link
                      href={`/admin/promotions/opportunities/${opp.uuid}/applications`}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      <span>Applications ({opp.application_count})</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/promotions/opportunities/${opp.uuid}`}
                      target="_blank"
                      className="rounded-lg border px-3 py-2 text-center text-sm font-medium hover:bg-muted"
                    >
                      Public view
                    </Link>
                    {(opp.status === 'open' || opp.status === 'reviewing') && (
                      <button
                        onClick={() => close.mutate(opp.uuid)}
                        disabled={close.isPending}
                        className="rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
                      >
                        Force close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
    </div>
  );
}
