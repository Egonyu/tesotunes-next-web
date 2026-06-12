'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock,
  Coins,
  Loader2,
  Target,
  XCircle,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { useAdminOpportunityApplications } from '@/hooks/usePromotionsV2';
import { APPLICATION_STATUS_LABELS, OPPORTUNITY_STATUS_LABELS } from '@/types/promotions-v2';
import type { ApplicationStatus, OpportunityStatus } from '@/types/promotions-v2';

const APP_STATUS_COLORS: Record<ApplicationStatus, string> = {
  submitted: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  shortlisted: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  awarded: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  rejected: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
  withdrawn: 'border-border bg-muted text-muted-foreground',
};

const OPP_STATUS_COLORS: Record<OpportunityStatus, string> = {
  open: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  reviewing: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  awarded: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  draft: 'border-border bg-muted text-muted-foreground',
  closed: 'border-border bg-muted text-muted-foreground',
  cancelled: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
};

export default function AdminOpportunityApplicationsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminOpportunityApplications(uuid, { per_page: 20, page });

  const opp = data?.opportunity;
  const apps = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/promotions/opportunities"
          className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">
            {opp?.title ?? 'Applications'}
          </h1>
          <p className="text-sm text-muted-foreground">
            All applications for this opportunity
          </p>
        </div>
      </div>

      {/* Opportunity summary card */}
      {opp && (
        <div className="rounded-xl bg-card shadow-sm p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={cn(
              'rounded-full border px-2.5 py-0.5 text-xs font-medium',
              OPP_STATUS_COLORS[opp.status as OpportunityStatus] ?? 'border-border bg-muted text-muted-foreground'
            )}>
              {OPPORTUNITY_STATUS_LABELS[opp.status as OpportunityStatus] ?? opp.status}
            </span>
            {opp.promotable && (
              <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground capitalize">
                {opp.promotable.type?.toLowerCase() ?? 'content'} · {opp.promotable.title}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              {formatNumber(total)} applications
            </span>
            {(opp.budget_min_ugx > 0 || opp.budget_max_ugx > 0) && (
              <span className="flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                {formatCurrency(opp.budget_min_ugx)} – {formatCurrency(opp.budget_max_ugx)} UGX
              </span>
            )}
            {opp.creator && (
              <span>
                Posted by <span className="font-medium text-foreground">{opp.creator.name}</span>
                {opp.creator.username && ` (@${opp.creator.username})`}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Link
              href={`/promotions/opportunities/${uuid}`}
              target="_blank"
              className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              Public view
            </Link>
            <Link
              href="/admin/promotions/opportunities"
              className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              All opportunities
            </Link>
          </div>
        </div>
      )}

      {/* Stats strip */}
      {apps.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', value: formatNumber(total) },
            { label: 'Submitted', value: formatNumber(apps.filter(a => a.status === 'submitted').length) },
            { label: 'Shortlisted', value: formatNumber(apps.filter(a => a.status === 'shortlisted').length) },
            { label: 'Awarded', value: formatNumber(apps.filter(a => a.status === 'awarded').length) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-card shadow-sm p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Application list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-card shadow-sm py-16 text-center">
          <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive/40" />
          <p className="font-medium">Could not load applications</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="rounded-xl bg-card shadow-sm py-16 text-center text-muted-foreground">
          No applications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="rounded-xl bg-card shadow-sm p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Promoter info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
                    {app.promoter?.user?.avatar_url ? (
                      <img
                        src={app.promoter.user.avatar_url}
                        alt={app.promoter.display_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-muted-foreground">
                        {app.promoter?.display_name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {app.promoter?.display_name ?? 'Unknown promoter'}
                      </span>
                      {app.promoter?.is_verified && (
                        <BadgeCheck className="h-4 w-4 text-blue-500" />
                      )}
                      <span className={cn(
                        'rounded-full border px-2 py-0.5 text-xs font-medium',
                        APP_STATUS_COLORS[app.status as ApplicationStatus] ?? 'border-border bg-muted text-muted-foreground'
                      )}>
                        {APPLICATION_STATUS_LABELS[app.status as ApplicationStatus] ?? app.status}
                      </span>
                    </div>

                    {app.promoter?.user && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {app.promoter.user.name} · @{app.promoter.user.username ?? app.promoter.slug} · {app.promoter.user.email}
                      </p>
                    )}

                    {app.pitch_message && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{app.pitch_message}</p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {app.proposed_price_ugx > 0 && (
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-amber-500" />
                          {formatCurrency(app.proposed_price_ugx)} UGX
                        </span>
                      )}
                      {app.proposed_price_credits > 0 && (
                        <span>{formatNumber(app.proposed_price_credits)} credits</span>
                      )}
                      {app.proposed_timeline_days > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {app.proposed_timeline_days}d
                        </span>
                      )}
                      <span className="text-muted-foreground/60">
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {app.artist_response && (
                      <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
                        <span className="font-medium text-foreground">Artist response: </span>
                        <span className="text-muted-foreground">{app.artist_response}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Promoter profile link */}
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  {app.promoter?.slug && (
                    <Link
                      href={`/promoters/${app.promoter.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      Profile
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
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
