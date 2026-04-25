'use client';

import { cn } from '@/lib/utils';
import { useObservabilityShellStore, type ShellTimeRange } from './shellStore';

const OPTIONS: Array<{ key: ShellTimeRange; label: string }> = [
  { key: '15m', label: '15m' },
  { key: '1h', label: '1h' },
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
];

export function TimeRangePicker() {
  const timeRange = useObservabilityShellStore((s) => s.timeRange);
  const setTimeRange = useObservabilityShellStore((s) => s.setTimeRange);

  return (
    <div role="group" aria-label="Time range" className="inline-flex rounded-lg border bg-card p-0.5 text-xs">
      {OPTIONS.map((option) => {
        const isActive = option.key === timeRange;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => setTimeRange(option.key)}
            aria-pressed={isActive}
            className={cn(
              'rounded-md px-2.5 py-1 font-medium transition-colors',
              isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
