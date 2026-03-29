'use client';

import type { ChangeEvent } from 'react';
import type { ObservabilityFilters } from '@/types/observability';

interface GlobalFilterBarProps {
  filters: ObservabilityFilters;
  onChange: (next: Partial<ObservabilityFilters>) => void;
  onReset: () => void;
}

export function GlobalFilterBar({ filters, onChange, onReset }: GlobalFilterBarProps) {
  const updateText = (key: keyof ObservabilityFilters) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ [key]: event.target.value || undefined });
  };

  const updateList = (key: keyof ObservabilityFilters) => (event: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    onChange({ [key]: values });
  };

  return (
    <div className="sticky top-16 z-20 rounded-2xl border bg-background/95 p-4 shadow-sm backdrop-blur lg:top-[4.5rem]">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <input
          value={filters.search ?? ''}
          onChange={updateText('search')}
          placeholder="Search IP, route, actor"
          className="rounded-xl border bg-background px-3 py-2 text-sm"
        />
        <input
          value={filters.ip ?? ''}
          onChange={updateText('ip')}
          placeholder="Source IP"
          className="rounded-xl border bg-background px-3 py-2 text-sm"
        />
        <input
          value={filters.route ?? ''}
          onChange={updateText('route')}
          placeholder="Route / endpoint"
          className="rounded-xl border bg-background px-3 py-2 text-sm"
        />
        <input
          value={filters.payment_reference ?? ''}
          onChange={updateText('payment_reference')}
          placeholder="Payment reference"
          className="rounded-xl border bg-background px-3 py-2 text-sm"
        />
        <input
          value={filters.host ?? ''}
          onChange={updateText('host')}
          placeholder="Host / node"
          className="rounded-xl border bg-background px-3 py-2 text-sm"
        />
        <input
          value={filters.country ?? ''}
          onChange={updateText('country')}
          placeholder="Country"
          className="rounded-xl border bg-background px-3 py-2 text-sm"
        />
        <input
          value={filters.container ?? ''}
          onChange={updateText('container')}
          placeholder="Container"
          className="rounded-xl border bg-background px-3 py-2 text-sm"
        />
        <input
          value={filters.admin_id ?? ''}
          onChange={updateText('admin_id')}
          placeholder="Admin ID"
          className="rounded-xl border bg-background px-3 py-2 text-sm"
        />
        <select
          multiple
          value={filters.severity}
          onChange={updateList('severity')}
          className="min-h-24 rounded-xl border bg-background px-3 py-2 text-sm"
        >
          {['low', 'medium', 'high', 'critical'].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select
          multiple
          value={filters.outcome}
          onChange={updateList('outcome')}
          className="min-h-24 rounded-xl border bg-background px-3 py-2 text-sm"
        >
          {['success', 'blocked', 'failed', 'suspicious'].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <p>Shared filters persist across tabs and deep links.</p>
        <button onClick={onReset} className="rounded-lg border px-3 py-1.5 text-foreground hover:bg-muted">
          Reset filters
        </button>
      </div>
    </div>
  );
}
