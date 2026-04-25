'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatThreshold = 'ok' | 'info' | 'warn' | 'crit' | 'muted';

interface StatCardProps {
  label: string;
  value: string | number | null | undefined;
  hint?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; label?: string };
  threshold?: StatThreshold;
  icon?: ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
}

const thresholdClasses: Record<StatThreshold, string> = {
  ok: 'border-emerald-200/70 dark:border-emerald-900/60',
  info: 'border-sky-200/70 dark:border-sky-900/60',
  warn: 'border-amber-300/70 dark:border-amber-800/60',
  crit: 'border-rose-300/80 dark:border-rose-800/70 bg-rose-50/40 dark:bg-rose-950/20',
  muted: 'border-border',
};

const valueClasses: Record<StatThreshold, string> = {
  ok: 'text-emerald-700 dark:text-emerald-300',
  info: 'text-sky-700 dark:text-sky-300',
  warn: 'text-amber-700 dark:text-amber-300',
  crit: 'text-rose-700 dark:text-rose-300',
  muted: 'text-foreground',
};

export function StatCard({
  label,
  value,
  hint,
  trend,
  threshold = 'muted',
  icon,
  onClick,
  isLoading,
}: StatCardProps) {
  const interactive = Boolean(onClick);
  const display = value === null || value === undefined ? '—' : value;

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        'rounded-2xl border bg-card p-5 shadow-sm transition-colors',
        thresholdClasses[threshold],
        interactive && 'cursor-pointer hover:border-foreground/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        {isLoading ? (
          <span className="h-7 w-16 animate-pulse rounded bg-muted" aria-hidden />
        ) : (
          <span className={cn('text-2xl font-semibold tracking-tight', valueClasses[threshold])}>
            {display}
          </span>
        )}
        {trend ? (
          <span
            className={cn(
              'text-xs',
              trend.direction === 'up' && 'text-rose-600 dark:text-rose-400',
              trend.direction === 'down' && 'text-emerald-600 dark:text-emerald-400',
              trend.direction === 'flat' && 'text-muted-foreground',
            )}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
            {trend.label ? ` ${trend.label}` : null}
          </span>
        ) : null}
      </div>

      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
