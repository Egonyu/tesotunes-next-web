'use client';

import { useMemo, useState } from 'react';
import {
  Loader2,
  Search,
  ThumbsUp,
  ThumbsDown,
  Languages,
  AlertTriangle,
  Inbox,
  ShieldQuestion,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import {
  useAdminSubmissions,
  useBulkReviewSubmissions,
  type AdminSubmission,
  type AdminVerdict,
  type SubmissionStatus,
} from '@/hooks/useContributionsAdmin';

/**
 * Operator review of the contribution backlog.
 *
 * An operator verdict clears the acceptance quorum on its own, mints corpus
 * pairs, and pays the contributor — so this is deliberately a *reading*
 * surface first and a bulk tool second. Every row shows the source line beside
 * the translation, because approving text nobody has read is how training data
 * gets poisoned.
 */

const VERDICTS: Array<{
  value: AdminVerdict;
  label: string;
  hint: string;
  icon: React.ElementType;
  tone: string;
}> = [
  {
    value: 'agree',
    label: 'Approve',
    hint: 'Correct — accept it, mint the pair, and pay the contributor.',
    icon: ThumbsUp,
    tone: 'bg-green-600 hover:bg-green-700 text-white',
  },
  {
    value: 'valid_variant',
    label: 'Valid variant',
    hint: 'Correct in another dialect — accepted as its own tagged pair.',
    icon: Languages,
    tone: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    value: 'reject',
    label: 'Reject',
    hint: 'Wrong — counts against acceptance. Nothing is paid.',
    icon: ThumbsDown,
    tone: 'bg-red-600 hover:bg-red-700 text-white',
  },
];

export function AdminReviewBacklog() {
  const [status, setStatus] = useState<SubmissionStatus | 'all'>('submitted');
  const [unreviewed, setUnreviewed] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<AdminVerdict | null>(null);

  const { data, isLoading, isFetching } = useAdminSubmissions({
    status,
    unreviewed: unreviewed || undefined,
    search: search || undefined,
    per_page: 50,
  });

  const bulkReview = useBulkReviewSubmissions();

  const rows = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta;

  // Only open work can take a verdict; selecting a settled row would just error.
  const actionable = useMemo(() => rows.filter((r) => r.status === 'submitted'), [rows]);
  const selectedRows = useMemo(
    () => actionable.filter((r) => selected.has(r.uuid)),
    [actionable, selected]
  );
  const goldSelected = selectedRows.filter((r) => r.is_gold).length;

  const allSelected = actionable.length > 0 && selectedRows.length === actionable.length;

  const toggle = (uuid: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(actionable.map((r) => r.uuid)));

  const applyVerdict = (verdict: AdminVerdict) => {
    bulkReview.mutate(
      { uuids: selectedRows.map((r) => r.uuid), verdict },
      {
        onSuccess: () => {
          setSelected(new Set());
          setPending(null);
        },
        onError: () => setPending(null),
      }
    );
  };

  const pendingVerdict = VERDICTS.find((v) => v.value === pending);

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" /> Review backlog
          </h2>
          <p className="text-sm text-muted-foreground">
            Your verdict is authoritative — it accepts the line on its own and pays the contributor.
            Read before you approve.
          </p>
        </div>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as SubmissionStatus | 'all');
            setSelected(new Set());
          }}
          className="px-3 py-1.5 border rounded-lg bg-background text-sm"
        >
          <option value="submitted">Awaiting review</option>
          <option value="accepted">Accepted</option>
          <option value="superseded">Superseded</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={unreviewed}
            onChange={(e) => {
              setUnreviewed(e.target.checked);
              setSelected(new Set());
            }}
          />
          Never reviewed only
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput.trim());
            setSelected(new Set());
          }}
          className="flex items-center gap-2 ml-auto"
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search text…"
              className="pl-8 pr-3 py-1.5 border rounded-lg bg-background text-sm"
            />
          </div>
          <button type="submit" className="px-3 py-1.5 border rounded-lg text-sm hover:bg-muted">
            Search
          </button>
        </form>
      </div>

      {/* Bulk action bar */}
      {selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <span className="text-sm font-medium">
            {selectedRows.length} selected
          </span>
          {goldSelected > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <ShieldQuestion className="h-3.5 w-3.5" />
              {goldSelected} gold item{goldSelected === 1 ? '' : 's'} — gold never mints corpus pairs
            </span>
          )}
          <div className="flex flex-wrap gap-2 ml-auto">
            {VERDICTS.map(({ value, label, icon: Icon, tone }) => (
              <button
                key={value}
                onClick={() => setPending(value)}
                disabled={bulkReview.isPending}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-60',
                  tone
                )}
              >
                {bulkReview.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rows */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">
          Nothing here. {status === 'submitted' ? 'The backlog is clear.' : 'Try another filter.'}
        </p>
      ) : (
        <>
          {actionable.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground border-b pb-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              Select all {actionable.length} reviewable on this page
            </label>
          )}

          <div className="divide-y">
            {rows.map((row) => (
              <SubmissionRow
                key={row.uuid}
                row={row}
                checked={selected.has(row.uuid)}
                onToggle={() => toggle(row.uuid)}
              />
            ))}
          </div>
        </>
      )}

      {meta && meta.total > rows.length && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          Showing {rows.length} of {meta.total.toLocaleString()} · quorum {meta.min_validations} validation
          {meta.min_validations === 1 ? '' : 's'} or one operator verdict
        </p>
      )}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(v) => !v && setPending(null)}
        onConfirm={() => pending && applyVerdict(pending)}
        isLoading={bulkReview.isPending}
        variant={pending === 'reject' ? 'danger' : 'warning'}
        title={`${pendingVerdict?.label ?? 'Apply'} ${selectedRows.length} submission${selectedRows.length === 1 ? '' : 's'}?`}
        confirmLabel={pendingVerdict?.label ?? 'Confirm'}
        description={
          pending === 'reject'
            ? 'These will be marked wrong. Nothing is paid and no corpus pair is minted.'
            : `${pendingVerdict?.hint ?? ''} This settles credits immediately and cannot be undone from here.`
        }
      />
    </div>
  );
}

function SubmissionRow({
  row,
  checked,
  onToggle,
}: {
  row: AdminSubmission;
  checked: boolean;
  onToggle: () => void;
}) {
  const reviewable = row.status === 'submitted';

  return (
    <div className={cn('flex gap-3 py-3', !reviewable && 'opacity-60')}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        disabled={!reviewable}
        className="mt-1 shrink-0"
        aria-label={`Select submission by ${row.contributor?.name ?? 'unknown'}`}
      />

      <div className="min-w-0 flex-1 space-y-1">
        {/* Source line first — this is what the translation must match. */}
        <p className="text-sm text-muted-foreground break-words">
          {row.source_text ?? <span className="italic">source line missing</span>}
        </p>
        <p className="font-medium break-words">{row.translation}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{row.contributor?.name ?? 'Unknown'}</span>
          {row.source_lang && row.target_lang && (
            <span>
              {row.source_lang} → {row.target_lang}
            </span>
          )}
          {row.register && <span>{row.register}</span>}
          {row.dialect && <span>dialect: {row.dialect}</span>}
          {row.is_code_switched && <span>code-switched</span>}
          {row.is_gold && (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" /> gold
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right space-y-1">
        <StatusPill status={row.status} settled={row.settled} />
        <p className="text-[11px] text-muted-foreground tabular-nums">
          {row.validations_count} review{row.validations_count === 1 ? '' : 's'} · approval{' '}
          {row.approval.toFixed(1)}
        </p>
        {reviewable && row.validations_needed > 0 && (
          <p className="text-[11px] text-muted-foreground">
            needs {row.validations_needed} more peer{row.validations_needed === 1 ? '' : 's'}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status, settled }: { status: SubmissionStatus; settled: boolean }) {
  const tone: Record<SubmissionStatus, string> = {
    submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    accepted: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    superseded: 'bg-muted text-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full',
        tone[status]
      )}
    >
      {status === 'accepted' && settled ? 'paid' : status}
    </span>
  );
}
