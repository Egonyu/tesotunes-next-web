'use client';

import { useState } from 'react';
import { useSecurityFeed } from '@/lib/security-console/hooks';
import type { FeedFilters, SecurityEvent } from '@/lib/security-console/types';
import {
  EmptyState,
  OutcomeBadge,
  SeverityBadge,
  SkeletonRows,
  formatWhen,
  riskClass,
} from './ui';

const DOMAINS = ['', 'auth', 'payments', 'api', 'integrity', 'system'];
const SEVERITIES = ['', 'low', 'medium', 'high', 'critical'];
const OUTCOMES = ['', 'success', 'failed', 'blocked', 'suspicious'];

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border bg-background px-2 py-1.5 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === '' ? 'All' : option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EventFeedPanel({ initialDomain = '' }: { initialDomain?: string }) {
  const [filters, setFilters] = useState<FeedFilters>({ domain: initialDomain });
  const feed = useSecurityFeed(filters);
  const rows: SecurityEvent[] = feed.data?.data ?? [];

  const patch = (next: Partial<FeedFilters>) => setFilters((prev) => ({ ...prev, ...next }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4 shadow-sm">
        <Select label="Domain" value={filters.domain ?? ''} options={DOMAINS} onChange={(v) => patch({ domain: v })} />
        <Select label="Severity" value={filters.severity ?? ''} options={SEVERITIES} onChange={(v) => patch({ severity: v })} />
        <Select label="Outcome" value={filters.outcome ?? ''} options={OUTCOMES} onChange={(v) => patch({ outcome: v })} />
        <label className="flex flex-1 flex-col gap-1 text-xs">
          <span className="font-medium text-muted-foreground">Search</span>
          <input
            type="search"
            placeholder="Title, IP, actor…"
            defaultValue={filters.search ?? ''}
            onChange={(e) => patch({ search: e.target.value })}
            className="rounded-lg border bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <span className="ml-auto self-center text-xs text-muted-foreground">
          {feed.data ? `${feed.data.meta.total} events` : ''}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {feed.isLoading ? (
          <div className="p-4">
            <SkeletonRows rows={6} />
          </div>
        ) : feed.isError ? (
          <div className="p-4">
            <EmptyState title="Could not load events" description="The security feed API returned an error." />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No events match these filters" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Actor / Source</th>
                <th className="px-4 py-2 font-medium">Outcome</th>
                <th className="px-4 py-2 font-medium">Severity</th>
                <th className="px-4 py-2 text-right font-medium">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((event) => (
                <tr key={event.id} className="align-top hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {formatWhen(event.occurred_at)}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.domain} · {event.category}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <p className="text-foreground">{event.actor.label ?? event.actor.type ?? '—'}</p>
                    <p className="font-mono text-muted-foreground">{event.source.ip ?? '—'}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <OutcomeBadge outcome={event.outcome} />
                  </td>
                  <td className="px-4 py-2.5">
                    <SeverityBadge severity={event.severity} />
                  </td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${riskClass(event.risk.score)}`}>
                    {event.risk.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
