'use client';

import type { ReactNode } from 'react';

/** Severity → text/badge colour classes (light + dark). */
export function severityText(severity: string | null | undefined): string {
  switch (severity) {
    case 'critical':
      return 'text-rose-600 dark:text-rose-300';
    case 'high':
      return 'text-amber-600 dark:text-amber-300';
    case 'medium':
      return 'text-sky-600 dark:text-sky-300';
    default:
      return 'text-muted-foreground';
  }
}

export function SeverityBadge({ severity }: { severity: string | null | undefined }) {
  const tone: Record<string, string> = {
    critical: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    high: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    medium: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    low: 'bg-muted text-muted-foreground',
  };
  const cls = tone[severity ?? 'low'] ?? tone.low;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {severity ?? 'low'}
    </span>
  );
}

export function OutcomeBadge({ outcome }: { outcome: string | null | undefined }) {
  const tone: Record<string, string> = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    failed: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    blocked: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    suspicious: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  };
  const cls = tone[outcome ?? ''] ?? 'bg-muted text-muted-foreground';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {outcome ?? '—'}
    </span>
  );
}

export type StatTone = 'muted' | 'ok' | 'warn' | 'crit';

const STAT_TONE: Record<StatTone, string> = {
  muted: 'text-foreground',
  ok: 'text-emerald-600 dark:text-emerald-300',
  warn: 'text-amber-600 dark:text-amber-300',
  crit: 'text-rose-600 dark:text-rose-300',
};

export function StatCard({
  label,
  value,
  tone = 'muted',
  hint,
  isLoading,
}: {
  label: string;
  value: number | string | undefined;
  tone?: StatTone;
  hint?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {isLoading && value === undefined ? (
        <div className="mt-2 h-7 w-16 animate-pulse rounded bg-muted" />
      ) : (
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${STAT_TONE[tone]}`}>
          {value ?? 0}
        </p>
      )}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export function riskClass(score: number): string {
  if (score >= 75) return 'font-semibold text-rose-600 dark:text-rose-300';
  if (score >= 45) return 'font-semibold text-amber-600 dark:text-amber-300';
  return 'text-foreground';
}

export function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}
