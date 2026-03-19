'use client';

import Link from 'next/link';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { PageHeader, FormSection, StatusBadge } from '@/components/admin';
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, Music4, UserRound } from 'lucide-react';

type SubmissionItem = {
  id: number;
  artist_name: string;
  song_title: string;
  audio_filename?: string | null;
  cover_filename?: string | null;
  status: string;
  phone_number?: string | null;
  email?: string | null;
  genre?: string | null;
  notes?: string | null;
  validation_errors?: Record<string, string[]>;
  artist?: {
    id: number;
    stage_name?: string | null;
    name?: string | null;
    is_placeholder?: boolean;
    claim_status?: string | null;
  } | null;
  song?: {
    id: number;
    title: string;
    status?: string;
    is_claimable?: boolean;
  } | null;
};

type Submission = {
  id: number;
  status: string;
  source_name?: string | null;
  csv_original_name: string;
  notes?: string | null;
  total_items: number;
  processed_items: number;
  failed_items: number;
  submitted_at?: string | null;
  processed_at?: string | null;
  uploader?: {
    id: number;
    name?: string;
    email?: string;
  } | null;
  items: SubmissionItem[];
};

export default function CatalogSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'catalog', 'submission', id],
    queryFn: () => apiGet<{ data: Submission }>(`/catalog/submissions/${id}`),
  });

  const submission = data?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading submission...
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Submission not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={submission.source_name?.trim() || `Submission #${submission.id}`}
        description="Review row-level materialization results for this catalog batch."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Catalog Intake', href: '/admin/catalog' },
          { label: `Submission #${submission.id}` },
        ]}
        backHref="/admin/catalog"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="mt-2"><StatusBadge status={submission.status} /></div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Rows</p>
          <p className="mt-2 text-2xl font-semibold">{submission.total_items}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Materialized</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{submission.processed_items}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Failed</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{submission.failed_items}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">CSV</p>
          <p className="mt-2 truncate text-sm font-medium">{submission.csv_original_name}</p>
        </div>
      </div>

      <FormSection title="Batch Context" description="Operational details for this upload.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Uploader</p>
            <p className="mt-2 font-medium">{submission.uploader?.name || submission.uploader?.email || 'Unknown'}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Timeline</p>
            <p className="mt-2 text-sm">
              Submitted: {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : '—'}
            </p>
            <p className="mt-1 text-sm">
              Processed: {submission.processed_at ? new Date(submission.processed_at).toLocaleString() : '—'}
            </p>
          </div>
        </div>
        {submission.notes ? (
          <div className="rounded-lg border bg-muted/20 p-4 text-sm text-foreground/85">
            {submission.notes}
          </div>
        ) : null}
      </FormSection>

      <FormSection title="Submission Items" description="Each CSV row is listed with its materialization outcome.">
        <div className="space-y-4">
          {submission.items.map((item) => (
            <div key={item.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">{item.song_title}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-4 w-4" />
                      {item.artist_name}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Music4 className="h-4 w-4" />
                      {item.audio_filename || 'No audio filename'}
                    </span>
                  </div>
                  {(item.genre || item.phone_number || item.email) ? (
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {item.genre ? <span>Genre: {item.genre}</span> : null}
                      {item.phone_number ? <span>Phone: {item.phone_number}</span> : null}
                      {item.email ? <span>Email: {item.email}</span> : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {item.artist?.id ? (
                    <Link
                      href={`/admin/artists/${item.artist.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                    >
                      Artist
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  ) : null}
                  {item.song?.id ? (
                    <Link
                      href={`/admin/songs/${item.song.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                    >
                      Song
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>

              {item.artist ? (
                <div className="mt-4 rounded-lg border bg-muted/20 p-3 text-sm">
                  Placeholder state: {item.artist.is_placeholder ? 'Placeholder artist' : 'Claimed artist'}
                  {item.artist.claim_status ? ` • Claim status: ${item.artist.claim_status}` : ''}
                </div>
              ) : null}

              {item.status === 'failed' && item.validation_errors ? (
                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/30">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4" />
                    Validation Errors
                  </div>
                  <ul className="space-y-1 text-sm text-rose-700 dark:text-rose-300">
                    {Object.entries(item.validation_errors).flatMap(([field, messages]) =>
                      messages.map((message, index) => (
                        <li key={`${field}-${index}`}>{field}: {message}</li>
                      ))
                    )}
                  </ul>
                </div>
              ) : null}

              {item.status === 'materialized' ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Materialized successfully and now available for discovery and future claim review.
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </FormSection>
    </div>
  );
}
