'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  ShieldX,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePendingKyc, useReviewKyc, type PendingKycUser, type KycDocument } from '@/hooks/useKyc';

export default function AdminKycReviewPage() {
  const [selectedUser, setSelectedUser] = useState<PendingKycUser | null>(null);
  const { data, isLoading, error } = usePendingKyc(20);
  const review = useReviewKyc();

  const users = data?.data ?? [];

  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Identity Verification — Review Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Users awaiting KYC review. Approving unlocks withdrawals, music claiming, and disputes.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Queue */}
        <aside className="rounded-xl border bg-card">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-sm">Pending</h2>
            <span className="text-xs text-muted-foreground">
              {data?.meta?.total ?? 0} total
            </span>
          </div>
          {isLoading && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 mx-auto animate-spin mb-2" />
              Loading…
            </div>
          )}
          {error && (
            <div className="p-6 text-center text-sm text-destructive">
              <AlertCircle className="h-5 w-5 mx-auto mb-2" />
              {(error as Error).message}
            </div>
          )}
          {!isLoading && !error && users.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No pending reviews. Good job.
            </div>
          )}
          <ul className="divide-y">
            {users.map((u) => (
              <li key={u.user_id}>
                <button
                  type="button"
                  onClick={() => setSelectedUser(u)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-accent/40 transition-colors',
                    selectedUser?.user_id === u.user_id && 'bg-accent/60',
                  )}
                >
                  <p className="font-medium truncate">{u.full_name ?? u.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Submitted {u.submitted_at ? new Date(u.submitted_at).toLocaleDateString() : '—'}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Detail */}
        <section className="rounded-xl border bg-card min-h-[400px]">
          {!selectedUser && (
            <div className="flex items-center justify-center h-full p-12 text-center text-sm text-muted-foreground">
              Select a submission from the queue to review.
            </div>
          )}
          {selectedUser && (
            <KycReviewDetail
              user={selectedUser}
              isPending={review.isPending}
              onDecide={async (decision, reason, notes) => {
                await review.mutateAsync({
                  userId: selectedUser.user_id,
                  decision,
                  reason,
                  notes,
                });
                setSelectedUser(null);
              }}
            />
          )}
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// Detail panel
// ============================================================================

interface KycReviewDetailProps {
  user: PendingKycUser;
  isPending: boolean;
  onDecide: (decision: 'approve' | 'reject', reason?: string, notes?: string) => Promise<void>;
}

function KycReviewDetail({ user, isPending, onDecide }: KycReviewDetailProps) {
  const [mode, setMode] = useState<'idle' | 'approve' | 'reject'>('idle');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{user.full_name ?? user.email}</h3>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground mt-1">
          KYC submitted: {user.submitted_at ? new Date(user.submitted_at).toLocaleString() : '—'}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Submitted documents
        </h4>
        <div className="space-y-2">
          {user.documents.length === 0 && (
            <p className="text-sm text-muted-foreground">No documents submitted.</p>
          )}
          {user.documents.map((doc) => (
            <KycDocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Required document checklist</h4>
        <ul className="space-y-1 text-sm">
          {user.requirements.required_document_types.map((req) => {
            const submitted = user.documents.some((d) => d.document_type === req.type);
            return (
              <li key={req.type} className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                    submitted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-600',
                  )}
                >
                  {submitted ? '✓' : '✗'}
                </span>
                {req.label}
              </li>
            );
          })}
        </ul>
      </div>

      {mode === 'idle' && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setMode('approve')}
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            Approve
          </button>
          <button
            type="button"
            onClick={() => setMode('reject')}
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <ShieldX className="h-4 w-4" />
            Reject
          </button>
        </div>
      )}

      {mode === 'approve' && (
        <div className="space-y-3 pt-4 border-t">
          <label className="block text-sm font-medium">Internal notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any notes for the audit log"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDecide('approve', undefined, notes || undefined)}
              disabled={isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Confirm approve
            </button>
            <button
              type="button"
              onClick={() => setMode('idle')}
              disabled={isPending}
              className="rounded-lg border px-4 py-2.5 text-sm hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === 'reject' && (
        <div className="space-y-3 pt-4 border-t">
          <label className="block text-sm font-medium">
            Reason for rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="The user will see this. Be specific — e.g. 'Selfie was blurry, please retake'."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDecide('reject', reason)}
              disabled={isPending || !reason.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldX className="h-4 w-4" />}
              Confirm reject
            </button>
            <button
              type="button"
              onClick={() => setMode('idle')}
              disabled={isPending}
              className="rounded-lg border px-4 py-2.5 text-sm hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function KycDocumentRow({ doc }: { doc: KycDocument }) {
  const labels: Record<string, string> = {
    national_id_front: 'National ID (front)',
    national_id_back: 'National ID (back)',
    selfie_with_id: 'Selfie with ID',
  };

  const statusStyle =
    doc.status === 'verified'
      ? 'bg-emerald-100 text-emerald-700'
      : doc.status === 'rejected'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';

  return (
    <div className="rounded-lg border bg-background px-3 py-2.5 flex items-start gap-3">
      <div className="h-10 w-10 shrink-0 bg-muted rounded-md flex items-center justify-center">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-sm">{labels[doc.document_type] ?? doc.document_type}</p>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', statusStyle)}>
            {doc.status}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Submitted {doc.submitted_at ? new Date(doc.submitted_at).toLocaleString() : '—'}
        </p>
        {doc.rejection_reason && (
          <p className="text-xs text-red-600 mt-1">{doc.rejection_reason}</p>
        )}
      </div>
    </div>
  );
}
