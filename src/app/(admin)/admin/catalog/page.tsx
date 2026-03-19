'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPostForm } from '@/lib/api';
import { PageHeader, FormActions, FormField, FormSection, StatusBadge } from '@/components/admin';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileAudio,
  FileSpreadsheet,
  FolderUp,
  Loader2,
  XCircle,
} from 'lucide-react';

type CatalogSubmissionItem = {
  id: number;
  artist_name: string;
  song_title: string;
  audio_filename: string | null;
  status: string;
};

type CatalogSubmission = {
  id: number;
  status: string;
  source_name?: string | null;
  csv_original_name: string;
  notes?: string | null;
  total_items: number;
  processed_items: number;
  failed_items: number;
  submitted_at?: string | null;
  uploader?: {
    id: number;
    name?: string;
    email?: string;
  } | null;
  items?: CatalogSubmissionItem[];
};

type SubmissionListResponse = {
  data: {
    data: CatalogSubmission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

function statusVariant(status: string): 'default' | 'success' | 'warning' | 'error' {
  if (status === 'processed' || status === 'materialized' || status === 'approved') return 'success';
  if (status === 'partial' || status === 'pending' || status === 'processing') return 'warning';
  if (status === 'failed' || status === 'rejected') return 'error';
  return 'default';
}

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

export default function CatalogPage() {
  const queryClient = useQueryClient();
  const [sourceName, setSourceName] = useState('');
  const [notes, setNotes] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'catalog', 'submissions'],
    queryFn: () => apiGet<SubmissionListResponse>('/catalog/submissions'),
  });

  const submissions = data?.data?.data ?? [];

  const totals = useMemo(
    () =>
      submissions.reduce(
        (acc, submission) => {
          acc.total += 1;
          acc.items += submission.total_items ?? 0;
          acc.processed += submission.processed_items ?? 0;
          acc.failed += submission.failed_items ?? 0;
          return acc;
        },
        { total: 0, items: 0, processed: 0, failed: 0 }
      ),
    [submissions]
  );

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const errors: Record<string, string> = {};
      if (!csvFile) errors.csv_file = 'CSV file is required';
      if (audioFiles.length === 0) errors.audio_files = 'At least one audio file is required';

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        throw new Error('Please fix the upload form errors.');
      }

      const formData = new FormData();
      formData.append('csv_file', csvFile as File);
      if (sourceName.trim()) formData.append('source_name', sourceName.trim());
      if (notes.trim()) formData.append('notes', notes.trim());
      audioFiles.forEach((file) => formData.append('audio_files[]', file));
      coverFiles.forEach((file) => formData.append('cover_files[]', file));

      return apiPostForm<{ message?: string }>('/catalog/submissions', formData);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Catalog submission uploaded successfully.');
      setSourceName('');
      setNotes('');
      setCsvFile(null);
      setAudioFiles([]);
      setCoverFiles([]);
      setFieldErrors({});
      queryClient.invalidateQueries({ queryKey: ['admin', 'catalog', 'submissions'] });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog Intake"
        description="Bulk upload music for offline artists using one CSV plus many files."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Catalog Intake' },
        ]}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Submissions</p>
          <p className="mt-1 text-2xl font-semibold">{totals.total}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Queued Songs</p>
          <p className="mt-1 text-2xl font-semibold">{totals.items}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Materialized</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{totals.processed}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Failed Rows</p>
          <p className="mt-1 text-2xl font-semibold text-rose-600">{totals.failed}</p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          uploadMutation.mutate();
        }}
      >
        <FormSection title="New Submission" description="CSV rows are matched to uploaded audio files by exact original filename.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Source Name" error={fieldErrors.source_name}>
              <input
                value={sourceName}
                onChange={(event) => setSourceName(event.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-2"
                placeholder="Studio batch, district intake, archive import..."
              />
            </FormField>
            <FormField label="CSV File" error={fieldErrors.csv_file} required hint="Required columns: audio_filename, artist_name, song_title">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-lg border bg-background px-4 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
              />
            </FormField>
          </div>

          <FormField label="Notes" error={fieldErrors.notes}>
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2"
              placeholder="Optional operational notes for this intake batch..."
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Audio Files" error={fieldErrors.audio_files} required>
              <input
                type="file"
                multiple
                accept=".mp3,.wav,.flac,.aac,.m4a,.ogg,audio/*"
                onChange={(event) => setAudioFiles(Array.from(event.target.files ?? []))}
                className="w-full rounded-lg border bg-background px-4 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
              />
            </FormField>
            <FormField label="Cover Files" error={fieldErrors.cover_files} hint="Optional, matched by cover_filename when present in the CSV.">
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,image/*"
                onChange={(event) => setCoverFiles(Array.from(event.target.files ?? []))}
                className="w-full rounded-lg border bg-background px-4 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileSpreadsheet className="h-4 w-4" />
                CSV
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{csvFile?.name || 'No CSV selected'}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileAudio className="h-4 w-4" />
                Audio Files
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{audioFiles.length} selected</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FolderUp className="h-4 w-4" />
                Cover Files
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{coverFiles.length} selected</p>
            </div>
          </div>

          <FormActions
            submitLabel={uploadMutation.isPending ? 'Uploading Submission...' : 'Upload Catalog Batch'}
            isSubmitting={uploadMutation.isPending}
          />
        </FormSection>
      </form>

      <FormSection title="Recent Submissions" description="Track what materialized and what needs follow-up.">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No catalog submissions yet.
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {submission.source_name?.trim() || submission.csv_original_name}
                      </h3>
                      <StatusBadge status={submission.status} variant={statusVariant(submission.status)} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      CSV: {submission.csv_original_name}
                      {submission.submitted_at ? ` • Submitted ${new Date(submission.submitted_at).toLocaleString()}` : ''}
                    </p>
                    {submission.notes ? <p className="text-sm text-foreground/80">{submission.notes}</p> : null}
                  </div>

                  <Link
                    href={`/admin/catalog/${submission.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <Eye className="h-4 w-4" />
                    Review Batch
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Rows</p>
                    <p className="mt-1 text-lg font-semibold">{submission.total_items}</p>
                  </div>
                  <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950/30">
                    <p className="text-xs text-muted-foreground">Materialized</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-600">{submission.processed_items}</p>
                  </div>
                  <div className="rounded-lg border bg-rose-50 p-3 dark:bg-rose-950/30">
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="mt-1 text-lg font-semibold text-rose-600">{submission.failed_items}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Uploader</p>
                    <p className="mt-1 truncate text-sm font-medium">
                      {submission.uploader?.name || submission.uploader?.email || 'Unknown'}
                    </p>
                  </div>
                </div>

                {submission.items && submission.items.length > 0 ? (
                  <div className="mt-4 grid gap-2">
                    {submission.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium">{item.artist_name}</span>
                          <span className="text-muted-foreground"> • {item.song_title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {item.status === 'materialized' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : item.status === 'failed' ? (
                            <XCircle className="h-4 w-4 text-rose-600" />
                          ) : (
                            <Clock3 className="h-4 w-4 text-amber-600" />
                          )}
                          <span className="capitalize text-muted-foreground">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </FormSection>
    </div>
  );
}
