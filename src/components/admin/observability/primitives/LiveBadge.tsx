'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LiveBadgeProps {
  lastUpdatedAt?: Date | number | null;
  isLive?: boolean;
  className?: string;
}

function formatAgo(ms: number) {
  if (ms < 2000) return 'just now';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function LiveBadge({ lastUpdatedAt, isLive = true, className }: LiveBadgeProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const ts = lastUpdatedAt instanceof Date ? lastUpdatedAt.getTime() : lastUpdatedAt ?? null;
  const label = ts ? formatAgo(Math.max(0, now - ts)) : 'no data yet';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs',
        isLive ? 'border-emerald-200/70 bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300' : 'border-muted bg-muted/30 text-muted-foreground',
        className,
      )}
      title={ts ? new Date(ts).toLocaleString() : undefined}
    >
      <span className="relative flex h-2 w-2">
        {isLive ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        ) : null}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', isLive ? 'bg-emerald-500' : 'bg-muted-foreground')} />
      </span>
      {isLive ? `Live · ${label}` : `Paused · ${label}`}
    </span>
  );
}
