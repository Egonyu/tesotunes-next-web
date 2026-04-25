'use client';

import { useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useObservabilityStore } from '@/stores';
import { LiveBadge } from '@/components/admin/observability/primitives';
import { FilterChipBar } from './FilterChipBar';
import { TimeRangePicker } from './TimeRangePicker';
import { useObservabilityShellStore } from './shellStore';

interface HeaderBarProps {
  lastUpdatedAt?: Date | number | null;
  onRefresh?: () => void;
  onOpenFilterForm?: () => void;
}

export function HeaderBar({ lastUpdatedAt, onRefresh, onOpenFilterForm }: HeaderBarProps) {
  const { filters, setFilters, resetFilters } = useObservabilityStore();
  const liveRefresh = useObservabilityShellStore((s) => s.liveRefresh);
  const toggleLiveRefresh = useObservabilityShellStore((s) => s.toggleLiveRefresh);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  return (
    <header className="space-y-3 border-b bg-card/40 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Observability</h1>
          <p className="text-xs text-muted-foreground">
            Platform health, threats, and investigations — one console.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TimeRangePicker />

          <button
            type="button"
            onClick={toggleLiveRefresh}
            className="inline-flex"
            aria-pressed={liveRefresh}
            title={liveRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
          >
            <LiveBadge lastUpdatedAt={lastUpdatedAt ?? null} isLive={liveRefresh} />
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={!onRefresh || isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
            Refresh
          </button>

          <button
            type="button"
            onClick={onOpenFilterForm}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>

      <FilterChipBar filters={filters} onApply={setFilters} onReset={resetFilters} />
    </header>
  );
}
