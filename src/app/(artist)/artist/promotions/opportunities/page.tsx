'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Eye,
  Loader2,
  Plus,
  Target,
  XCircle,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import {
  useMyPostedOpportunities,
  useCloseOpportunity,
  useCancelOpportunity,
  useOpportunityApplications,
  useAwardApplication,
  useShortlistApplication,
} from '@/hooks/usePromotionsV2';
import { OPPORTUNITY_STATUS_LABELS, APPLICATION_STATUS_LABELS } from '@/types/promotions-v2';
import type { OpportunityStatus, ApplicationStatus } from '@/types/promotions-v2';

const STATUS_COLORS: Record<OpportunityStatus, string> = {
  open: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  reviewing: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  awarded: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  draft: 'border-border bg-muted text-muted-foreground',
  closed: 'border-border bg-muted text-muted-foreground',
  cancelled: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
};

const APP_STATUS_COLORS: Record<ApplicationStatus, string> = {
  submitted: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  shortlisted: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  awarded: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-red-500/10 text-red-700 dark:text-red-300',
  withdrawn: 'bg-muted text-muted-foreground',
};

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function ApplicationsPanel({ opportunityUuid }: { opportunityUuid: string }) {
  const { data, isLoading } = useOpportunityApplications(opportunityUuid, { per_page: 10 });
  const award = useAwardApplication(opportunityUuid);
  const shortlist = useShortlistApplication(opportunityUuid);

  const apps = data?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  }

  if (apps.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">No applications yet.</p>;
  }

  return (
    <div className="space-y-3 mt-4">
      {apps.map((app) => (
        <div key={app.uuid} className="rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-sm">
                  {(app.promoter_profile as { display_name?: string })?.display_name ?? 'Promoter'}
                </span>
                {(app.promoter_profile as { is_verified?: boolean })?.is_verified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                )}
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', APP_STATUS_COLORS[app.status as ApplicationStatus])}>
                  {APPLICATION_STATUS_LABELS[app.status as ApplicationStatus] ?? app.status}
                </span>
              </div>
              {app.pitch_message && (
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{app.pitch_message}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {(app.proposed_price_ugx as number) > 0 && (
                  <span>{formatCurrency(app.proposed_price_ugx as number)} UGX</span>
                )}
                {(app.proposed_price_credits as number) > 0 && (
                  <span>{formatNumber(app.proposed_price_credits as number)} cr</span>
                )}
                {app.proposed_timeline_days && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {app.proposed_timeline_days as number}d
                  </span>
                )}
              </div>
            </div>

            {(app.status === 'submitted' || app.status === 'shortlisted') && (
              <div className="flex gap-2 sm:shrink-0">
                {app.status === 'submitted' && (
                  <button
                    onClick={() => shortlist.mutate(app.id)}
                    disabled={shortlist.isPending}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
                  >
                    Shortlist
                  </button>
                )}
                <button
                  onClick={() => award.mutate(app.id)}
                  disabled={award.isPending}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  Award
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ArtistOpportunitiesPage() {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError } = useMyPostedOpportunities({ page, per_page: 10 });
  const close = useCloseOpportunity();
  const cancel = useCancelOpportunity();

  const opportunities = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            Promotion briefs you posted for your songs and albums
          </p>
        </div>
        <Link
          href="/artist/promotions/opportunities/create"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Post opportunity
        </Link>
      </div>

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
        <div className="rounded-xl bg-card shadow-sm py-16 text-center">
          <Target className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="font-semibold">No opportunities yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Post a brief for a song or album to get promoters applying
          </p>
          <Link
            href="/artist/promotions/opportunities/create"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Post your first opportunity
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => {
            const days = daysUntil(opp.deadline_at);
            const isExpanded = expandedId === opp.uuid;

            return (
              <div key={opp.uuid} className="rounded-xl bg-card shadow-sm">
                {/* Main row */}
                <div className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          STATUS_COLORS[opp.status as OpportunityStatus] ?? 'border-border bg-muted text-muted-foreground'
                        )}>
                          {OPPORTUNITY_STATUS_LABELS[opp.status as OpportunityStatus] ?? opp.status}
                        </span>
                        {opp.promotable && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {String(opp.promotable.type ?? '').toLowerCase() === 'song' ? 'Song' : 'Album'}: {String(opp.promotable.title ?? opp.promotable.name ?? '')}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 font-semibold">{opp.title}</h3>

                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : opp.uuid)}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          <Target className="h-3.5 w-3.5" />
                          {opp.application_count} applications
                        </button>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {opp.view_count} views
                        </span>
                        {days !== null && (
                          <span className={cn('flex items-center gap-1', days < 3 ? 'text-red-500' : '')}>
                            <Clock className="h-3.5 w-3.5" />
                            {days > 0 ? `${days}d remaining` : 'Deadline passed'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : opp.uuid)}
                        className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                      >
                        Applications
                        <ArrowRight className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90')} />
                      </button>

                      {(opp.status === 'open' || opp.status === 'reviewing') && (
                        <>
                          <button
                            onClick={() => close.mutate(opp.uuid)}
                            disabled={close.isPending}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
                          >
                            Close
                          </button>
                          <button
                            onClick={() => cancel.mutate(opp.uuid)}
                            disabled={cancel.isPending}
                            className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Applications panel */}
                {isExpanded && (
                  <div className="border-t px-5 pb-5">
                    <ApplicationsPanel opportunityUuid={opp.uuid} />
                  </div>
                )}
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
