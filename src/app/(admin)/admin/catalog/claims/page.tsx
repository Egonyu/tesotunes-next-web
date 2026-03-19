'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { PageHeader, FormSection, StatusBadge } from '@/components/admin';
import { toast } from 'sonner';
import { BadgeCheck, Loader2, MessageSquareText, Phone, UserRound } from 'lucide-react';

type CatalogClaim = {
  id: number;
  status: string;
  phone_number?: string | null;
  message: string;
  evidence?: string[] | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
  requested_song_ids?: number[] | null;
  artist?: {
    id: number;
    name?: string | null;
    stage_name?: string | null;
    claim_status?: string | null;
    is_placeholder?: boolean;
  } | null;
  claimant?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
  reviewer?: {
    id: number;
    name?: string | null;
  } | null;
};

type ClaimsResponse = {
  data: {
    data: CatalogClaim[];
    total: number;
  };
};

function apiErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Request failed';
  }

  return error instanceof Error ? error.message : 'Request failed';
}

export default function CatalogClaimsPage() {
  const queryClient = useQueryClient();
  const [rejectReasonByClaim, setRejectReasonByClaim] = useState<Record<number, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'catalog', 'claims'],
    queryFn: () => apiGet<ClaimsResponse>('/admin/catalog/claim-requests'),
  });

  const claims = data?.data?.data ?? [];

  const pendingCount = useMemo(
    () => claims.filter((claim) => claim.status === 'pending' || claim.status === 'under_review').length,
    [claims]
  );

  const approveMutation = useMutation({
    mutationFn: (claimId: number) => apiPost(`/admin/catalog/claim-requests/${claimId}/approve`, {}),
    onSuccess: () => {
      toast.success('Claim approved successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'catalog', 'claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ claimId, reason }: { claimId: number; reason: string }) =>
      apiPost(`/admin/catalog/claim-requests/${claimId}/reject`, { reason }),
    onSuccess: () => {
      toast.success('Claim rejected successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'catalog', 'claims'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claim Review"
        description="Approve or reject ownership claims for placeholder artists."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Claim Review' },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Claims</p>
          <p className="mt-1 text-2xl font-semibold">{claims.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{pendingCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {claims.filter((claim) => claim.status === 'approved').length}
          </p>
        </div>
      </div>

      <FormSection title="Claim Queue" description="Review artist-level claims with the claimant message and supporting evidence.">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading claim requests...
          </div>
        ) : claims.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No catalog claims are waiting right now.
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => {
              const rejectReason = rejectReasonByClaim[claim.id] ?? '';
              const pending = claim.status === 'pending' || claim.status === 'under_review';

              return (
                <div key={claim.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {claim.artist?.stage_name || claim.artist?.name || 'Unknown artist'}
                        </h3>
                        <StatusBadge status={claim.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <UserRound className="h-4 w-4" />
                          {claim.claimant?.name || claim.claimant?.email || 'Unknown claimant'}
                        </span>
                        {claim.phone_number ? (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {claim.phone_number}
                          </span>
                        ) : null}
                        {claim.created_at ? <span>{new Date(claim.created_at).toLocaleString()}</span> : null}
                      </div>
                    </div>

                    {claim.artist?.id ? (
                      <a
                        href={`/admin/artists/${claim.artist.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                      >
                        Open Artist
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[2fr,1fr]">
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <MessageSquareText className="h-4 w-4" />
                        Claim Message
                      </div>
                      <p className="text-sm text-foreground/85">{claim.message}</p>
                      {claim.evidence && claim.evidence.length > 0 ? (
                        <div className="mt-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Evidence</p>
                          <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                            {claim.evidence.map((entry, index) => (
                              <li key={`${claim.id}-evidence-${index}`}>{entry}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {claim.requested_song_ids && claim.requested_song_ids.length > 0 ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Requested song IDs: {claim.requested_song_ids.join(', ')}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-lg border bg-card p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <BadgeCheck className="h-4 w-4" />
                        Review Action
                      </div>

                      {pending ? (
                        <div className="space-y-3">
                          <button
                            onClick={() => approveMutation.mutate(claim.id)}
                            disabled={approveMutation.isPending}
                            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Approve Claim
                          </button>
                          <textarea
                            rows={4}
                            value={rejectReason}
                            onChange={(event) =>
                              setRejectReasonByClaim((prev) => ({
                                ...prev,
                                [claim.id]: event.target.value,
                              }))
                            }
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            placeholder="Reason for rejection if this claim cannot be approved..."
                          />
                          <button
                            onClick={() => rejectMutation.mutate({ claimId: claim.id, reason: rejectReason })}
                            disabled={rejectMutation.isPending || !rejectReason.trim()}
                            className="w-full rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"
                          >
                            Reject Claim
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>Reviewed: {claim.reviewed_at ? new Date(claim.reviewed_at).toLocaleString() : '—'}</p>
                          <p>Reviewer: {claim.reviewer?.name || '—'}</p>
                          {claim.rejection_reason ? (
                            <p className="text-rose-600">Reason: {claim.rejection_reason}</p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FormSection>
    </div>
  );
}
