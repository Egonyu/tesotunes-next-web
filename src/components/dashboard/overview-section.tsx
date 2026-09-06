'use client';

import { Activity as ActivityIcon, Loader2 } from 'lucide-react';
import { useDashboardOverview } from '@/hooks/useDashboard';
import {
  ArtistModule,
  ContributionsModule,
  EarningsModule,
  ListeningModule,
  ModuleCard,
  NeedsYouNowModule,
  WalletsModule,
} from './modules';

/**
 * The account dashboard body.
 *
 * One request serves the whole screen, and every block below the wallets is
 * gated on what the account actually is — a listener, a contributor, an artist
 * — so nobody is shown a permanent zero for a capability they do not hold.
 *
 * Scope is the page body: the platform header and tab bar are not this
 * component's to draw.
 */
export function DashboardOverviewSection() {
  const { data, isLoading, isError } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-sm font-medium">We couldn&apos;t load your dashboard</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check your connection and refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NeedsYouNowModule
        actions={data.next_actions}
        completion={data.profile.completion_percentage}
      />

      <WalletsModule wallet={data.wallet} />

      <EarningsModule earnings={data.earnings} />

      <ListeningModule listening={data.listening} />

      {data.contributions && <ContributionsModule contributions={data.contributions} />}

      {data.artist && <ArtistModule artist={data.artist} />}

      {data.recent_activity.length > 0 && (
        <ModuleCard title="What happened" icon={ActivityIcon}>
          <ul className="divide-y">
            {data.recent_activity.map((entry, i) => (
              <li
                key={`${entry.type}-${entry.at ?? i}`}
                className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <span className="min-w-0 truncate text-sm">{entry.label}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {entry.at
                    ? new Date(entry.at).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                      })
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </ModuleCard>
      )}
    </div>
  );
}
