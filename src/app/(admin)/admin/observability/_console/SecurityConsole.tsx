'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { EventFeedPanel } from './EventFeedPanel';
import { IncidentsPanel } from './IncidentsPanel';
import { OverviewPanel } from './OverviewPanel';

type TabKey = 'overview' | 'feed' | 'incidents';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'feed', label: 'Event feed' },
  { key: 'incidents', label: 'Incidents' },
];

/**
 * Security Console — the rebuilt observability surface.
 *
 * Reads exclusively from the push-based `/admin/observability/console/*` API:
 * the SecurityEventRecorder records events at every touchpoint, the detection
 * engine correlates them into incidents, and this view polls the result.
 */
export function SecurityConsole() {
  const [tab, setTab] = useState<TabKey>('overview');
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['security-console'] });
    setRefreshing(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Security Console</h1>
            <p className="text-xs text-muted-foreground">
              Live threat monitoring across auth, payments, API and integrity.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live · 20s
          </span>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <nav className="flex gap-1 border-b">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === item.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div>
        {tab === 'overview' ? <OverviewPanel /> : null}
        {tab === 'feed' ? <EventFeedPanel /> : null}
        {tab === 'incidents' ? <IncidentsPanel /> : null}
      </div>
    </div>
  );
}
