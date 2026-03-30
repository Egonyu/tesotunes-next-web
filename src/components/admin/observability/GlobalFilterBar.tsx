'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ObservabilityFilters } from '@/types/observability';

interface GlobalFilterBarProps {
  filters: ObservabilityFilters;
  onApply: (next: Partial<ObservabilityFilters>) => void;
  onReset: () => void;
}

const severityOptions = ['low', 'medium', 'high', 'critical'];
const outcomeOptions = ['success', 'blocked', 'failed', 'suspicious'];
const actorOptions = ['guest', 'user', 'admin', 'service', 'api_key', 'webhook'];

function createDraft(filters: ObservabilityFilters): ObservabilityFilters {
  return {
    from: filters.from,
    to: filters.to,
    severity: [...filters.severity],
    domain: [...filters.domain],
    category: [...filters.category],
    outcome: [...filters.outcome],
    route: filters.route,
    actor_type: [...filters.actor_type],
    user_id: filters.user_id,
    admin_id: filters.admin_id,
    ip: filters.ip,
    asn: filters.asn,
    country: filters.country,
    payment_reference: filters.payment_reference,
    host: filters.host,
    container: filters.container,
    incident_id: filters.incident_id,
    search: filters.search,
  };
}

function normalizeText(value?: string) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

export function GlobalFilterBar({ filters, onApply, onReset }: GlobalFilterBarProps) {
  const [draft, setDraft] = useState<ObservabilityFilters>(() => createDraft(filters));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setDraft(createDraft(filters));
  }, [filters]);

  const appliedCount = useMemo(() => {
    const values = Object.values(filters);

    return values.reduce((count, value) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }

      return value ? count + 1 : count;
    }, 0);
  }, [filters]);

  const updateText = (key: keyof ObservabilityFilters) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleListValue = (key: 'severity' | 'outcome' | 'actor_type', value: string) => {
    setDraft((current) => {
      const currentValues = current[key];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...current,
        [key]: nextValues,
      };
    });
  };

  const applyFilters = () => {
    onApply({
      ...draft,
      from: normalizeText(draft.from),
      to: normalizeText(draft.to),
      route: normalizeText(draft.route),
      user_id: normalizeText(draft.user_id),
      admin_id: normalizeText(draft.admin_id),
      ip: normalizeText(draft.ip),
      asn: normalizeText(draft.asn),
      country: normalizeText(draft.country),
      payment_reference: normalizeText(draft.payment_reference),
      host: normalizeText(draft.host),
      container: normalizeText(draft.container),
      incident_id: normalizeText(draft.incident_id),
      search: normalizeText(draft.search),
    });
  };

  return (
    <div className="sticky top-16 z-20 rounded-2xl border bg-background/95 p-4 shadow-sm backdrop-blur lg:top-[4.5rem]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Investigation Filters</p>
            <p className="text-xs text-muted-foreground">Apply shared filters once, then keep moving across tabs without refetch churn.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-muted-foreground">
              {appliedCount} active filter{appliedCount === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={() => setShowAdvanced((current) => !current)}
              className="rounded-lg border px-3 py-1.5 text-foreground transition hover:bg-muted"
            >
              {showAdvanced ? 'Hide advanced' : 'Show advanced'}
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-lg bg-foreground px-3 py-1.5 text-background transition hover:opacity-90"
            >
              Apply filters
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={draft.search ?? ''}
            onChange={updateText('search')}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                applyFilters();
              }
            }}
            placeholder="Search IP, route, actor, payment"
            className="rounded-xl border bg-background px-3 py-2 text-sm"
          />
          <input
            value={draft.ip ?? ''}
            onChange={updateText('ip')}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                applyFilters();
              }
            }}
            placeholder="Source IP"
            className="rounded-xl border bg-background px-3 py-2 text-sm"
          />
          <input
            value={draft.route ?? ''}
            onChange={updateText('route')}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                applyFilters();
              }
            }}
            placeholder="Route / endpoint"
            className="rounded-xl border bg-background px-3 py-2 text-sm"
          />
          <input
            value={draft.payment_reference ?? ''}
            onChange={updateText('payment_reference')}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                applyFilters();
              }
            }}
            placeholder="Payment reference"
            className="rounded-xl border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Severity</p>
            <div className="flex flex-wrap gap-2">
              {severityOptions.map((option) => {
                const active = draft.severity.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleListValue('severity', option)}
                    className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                      active
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Outcome</p>
            <div className="flex flex-wrap gap-2">
              {outcomeOptions.map((option) => {
                const active = draft.outcome.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleListValue('outcome', option)}
                    className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                      active
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Actor Type</p>
            <div className="flex flex-wrap gap-2">
              {actorOptions.map((option) => {
                const active = draft.actor_type.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleListValue('actor_type', option)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      active
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    }`}
                  >
                    {option.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {showAdvanced ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <input
              type="date"
              value={draft.from ?? ''}
              onChange={updateText('from')}
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={draft.to ?? ''}
              onChange={updateText('to')}
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
            <input
              value={draft.host ?? ''}
              onChange={updateText('host')}
              placeholder="Host / node"
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
            <input
              value={draft.container ?? ''}
              onChange={updateText('container')}
              placeholder="Container"
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
            <input
              value={draft.country ?? ''}
              onChange={updateText('country')}
              placeholder="Country"
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
            <input
              value={draft.asn ?? ''}
              onChange={updateText('asn')}
              placeholder="ASN"
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
            <input
              value={draft.user_id ?? ''}
              onChange={updateText('user_id')}
              placeholder="User ID"
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
            <input
              value={draft.admin_id ?? ''}
              onChange={updateText('admin_id')}
              placeholder="Admin ID"
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
            <input
              value={draft.incident_id ?? ''}
              onChange={updateText('incident_id')}
              placeholder="Incident ID"
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <p>Shared filters persist across tabs and deep links.</p>
        <button type="button" onClick={onReset} className="rounded-lg border px-3 py-1.5 text-foreground hover:bg-muted">
          Reset filters
        </button>
      </div>
    </div>
  );
}
