'use client';

import { cn } from '@/lib/utils';

export type CollectorState = 'ok' | 'stale' | 'down' | 'unknown';

interface CollectorDotProps {
  state: CollectorState;
  label?: string;
  pulse?: boolean;
  className?: string;
}

const stateClasses: Record<CollectorState, string> = {
  ok: 'bg-emerald-500',
  stale: 'bg-amber-500',
  down: 'bg-rose-500',
  unknown: 'bg-slate-400',
};

const stateLabel: Record<CollectorState, string> = {
  ok: 'Healthy',
  stale: 'Stale',
  down: 'Down',
  unknown: 'Unknown',
};

export function CollectorDot({ state, label, pulse, className }: CollectorDotProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs', className)}>
      <span className="relative flex h-2.5 w-2.5">
        {pulse && state !== 'down' ? (
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', stateClasses[state])} />
        ) : null}
        <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', stateClasses[state])} />
      </span>
      <span className="text-muted-foreground">{label ?? stateLabel[state]}</span>
    </span>
  );
}
