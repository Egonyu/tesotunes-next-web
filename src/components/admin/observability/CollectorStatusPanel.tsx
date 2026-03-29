'use client';

import type { SystemHostDetail } from '@/types/observability';

interface CollectorStatusPanelProps {
  collector?: SystemHostDetail['collector'] | null;
  onSelectHost?: (host: string) => void;
}

export function CollectorStatusPanel({ collector, onSelectHost }: CollectorStatusPanelProps) {
  const hosts = collector?.hosts ?? [];
  const summary = collector?.summary;
  const streams = collector?.stream_summary ?? [];
  const systemBreakdown = collector?.system_breakdown ?? [];

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Collector Coverage</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Recent external host and database signals flowing into the shared observability pipeline.
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>Last seen</div>
          <div className="mt-1 font-medium text-foreground">{summary?.last_seen_at ?? 'No collector data'}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-8">
        <div className="rounded-xl bg-muted p-3">
          <div className="text-xs text-muted-foreground">Collector events</div>
          <div className="mt-2 text-2xl font-semibold">{summary?.events ?? 0}</div>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="text-xs text-muted-foreground">Hosts reporting</div>
          <div className="mt-2 text-2xl font-semibold">{summary?.hosts ?? 0}</div>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="text-xs text-muted-foreground">System signals</div>
          <div className="mt-2 text-2xl font-semibold">{summary?.system_signals ?? 0}</div>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="text-xs text-muted-foreground">DB signals</div>
          <div className="mt-2 text-2xl font-semibold">{summary?.db_signals ?? 0}</div>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="text-xs text-muted-foreground">Stale sources</div>
          <div className="mt-2 text-2xl font-semibold">{summary?.stale_sources ?? 0}</div>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="text-xs text-muted-foreground">Healthy sources</div>
          <div className="mt-2 text-2xl font-semibold">{summary?.healthy_sources ?? 0}</div>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="text-xs text-muted-foreground">Reporting streams</div>
          <div className="mt-2 text-2xl font-semibold">{summary?.reporting_streams ?? 0}</div>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="text-xs text-muted-foreground">Telemetry gaps</div>
          <div className="mt-2 text-2xl font-semibold">{summary?.telemetry_gaps ?? 0}</div>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="text-xs text-muted-foreground">Uncovered classes</div>
          <div className="mt-2 text-2xl font-semibold">{summary?.uncovered_signal_classes ?? 0}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h4 className="text-sm font-semibold">System Signal Classes</h4>
          <div className="mt-3 space-y-2">
            {systemBreakdown.length === 0 ? (
              <div className="text-sm text-muted-foreground">No classified system collector signals yet.</div>
            ) : (
              systemBreakdown.map((row) => (
                <div key={row.type} className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <div className="font-medium capitalize">{row.type.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-muted-foreground">{row.last_seen_at ?? 'Unknown last seen'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{row.events}</div>
                    <div className="text-xs text-muted-foreground">max risk {row.max_risk_score}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h4 className="text-sm font-semibold">Collector Streams</h4>
          <div className="mt-3 space-y-2">
            {streams.length === 0 ? (
              <div className="text-sm text-muted-foreground">No stream-level collector data yet.</div>
            ) : (
              streams.map((stream) => (
                <div key={stream.stream} className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <div className="font-medium">{stream.stream}</div>
                    <div className="text-xs text-muted-foreground">{stream.hosts} hosts reporting</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{stream.events}</div>
                    <div className="text-xs text-muted-foreground">max risk {stream.max_risk_score}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border p-4">
        <h4 className="text-sm font-semibold">Missing Signal Classes</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {(collector?.uncovered_signals ?? []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No uncovered system signal classes in this window.</div>
          ) : (
            (collector?.uncovered_signals ?? []).map((signal) => (
              <span key={signal} className="rounded-full border px-3 py-1 text-xs">
                {signal.replace(/_/g, ' ')}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {hosts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No collector hosts have reported into this time window yet.
          </div>
        ) : (
          hosts.map((host) => (
            <div key={host.host} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectHost?.(host.host)}
                    className="font-medium text-left hover:underline"
                  >
                    {host.host}
                  </button>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {host.events} events · severity {host.max_severity} · max risk {host.max_risk_score}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div className="font-medium capitalize text-foreground">{host.status}</div>
                  <div className="mt-1">{host.last_seen_at ?? 'Unknown'}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Domains: {host.domains.join(', ') || 'n/a'}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Streams: {host.streams.join(', ') || 'n/a'}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Coverage: {host.coverage_score}% · Missing: {host.missing_signals.join(', ') || 'none'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
