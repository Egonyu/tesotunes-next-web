'use client';

import Link from 'next/link';
import { CheckCircle2, Clock3, Loader2, Search, ShieldAlert, XCircle } from 'lucide-react';
import { useMyCatalogClaims } from '@/hooks/api';

const STATUS_STYLES: Record<string, string> = {
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300',
  pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300',
  under_review: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300',
  cancelled: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
};

export default function SettingsClaimsPage() {
  const { data: claims = [], isLoading } = useMyCatalogClaims();

  const activeClaims = claims.filter((claim) => ['pending', 'under_review'].includes(claim.status));
  const resolvedClaims = claims.filter((claim) => !['pending', 'under_review'].includes(claim.status));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">My Artist Claims</h2>
          <p className="text-muted-foreground text-sm">
            Track the artist profiles you have asked to claim and see when review decisions are made.
          </p>
        </div>
        <Link
          href="/claim-artist"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          Find another artist
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading your claims...
        </div>
      ) : claims.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="font-semibold">No artist claims yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            If music was uploaded on your behalf, you can search for the placeholder artist and request ownership.
          </p>
          <Link
            href="/claim-artist"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start a claim
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">Active claims</h3>
              <p className="text-sm text-muted-foreground">These requests are still waiting for review or a final decision.</p>
            </div>
            {activeClaims.length === 0 ? (
              <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                You have no active artist claims right now.
              </div>
            ) : (
              <div className="space-y-3">
                {activeClaims.map((claim) => (
                  <ClaimCard key={claim.id} {...claim} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="font-medium">Claim history</h3>
              <p className="text-sm text-muted-foreground">Past outcomes stay here so you can revisit what happened.</p>
            </div>
            {resolvedClaims.length === 0 ? (
              <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                Resolved claims will appear here after review.
              </div>
            ) : (
              <div className="space-y-3">
                {resolvedClaims.map((claim) => (
                  <ClaimCard key={claim.id} {...claim} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

type ClaimCardProps = NonNullable<ReturnType<typeof useMyCatalogClaims>['data']>[number];

function ClaimCard(claim: ClaimCardProps) {
  const badgeClassName = STATUS_STYLES[claim.status] || STATUS_STYLES.pending;

  return (
    <div className="rounded-xl border p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{claim.artist?.name || 'Unknown artist'}</p>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${badgeClassName}`}>
              {claim.status.replace(/_/g, ' ')}
            </span>
          </div>
          {claim.artist?.slug ? (
            <p className="text-sm text-muted-foreground">@{claim.artist.slug}</p>
          ) : null}
          <p className="text-sm text-foreground/80">{claim.message}</p>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          <p>Submitted {claim.created_at ? new Date(claim.created_at).toLocaleString() : 'recently'}</p>
          {claim.reviewed_at ? (
            <p className="mt-1">Reviewed {new Date(claim.reviewed_at).toLocaleString()}</p>
          ) : null}
        </div>
      </div>

      {claim.status === 'approved' ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          <p>This claim was approved. Your account should now control this artist profile.</p>
        </div>
      ) : null}

      {claim.status === 'rejected' ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-300">
          <XCircle className="mt-0.5 h-4 w-4" />
          <div>
            <p>This claim was not approved.</p>
            {claim.rejection_reason ? <p className="mt-1">{claim.rejection_reason}</p> : null}
          </div>
        </div>
      ) : null}

      {['pending', 'under_review'].includes(claim.status) ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
          <Clock3 className="mt-0.5 h-4 w-4" />
          <p>This request is still being checked. You do not need to submit another claim for the same artist.</p>
        </div>
      ) : null}
    </div>
  );
}
