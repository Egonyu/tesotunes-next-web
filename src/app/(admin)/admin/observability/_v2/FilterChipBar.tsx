'use client';

import { useMemo } from 'react';
import { X } from 'lucide-react';
import type { ObservabilityFilters } from '@/types/observability';
import { cn } from '@/lib/utils';

interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface FilterChipBarProps {
  filters: ObservabilityFilters;
  onApply: (next: Partial<ObservabilityFilters>) => void;
  onReset: () => void;
  className?: string;
}

const LIST_KEYS: Array<keyof ObservabilityFilters> = ['severity', 'domain', 'category', 'outcome', 'actor_type'];

const TEXT_KEYS: Array<keyof ObservabilityFilters> = [
  'from',
  'to',
  'search',
  'user_id',
  'admin_id',
  'ip',
  'asn',
  'country',
  'route',
  'payment_reference',
  'host',
  'container',
  'incident_id',
];

const LABELS: Partial<Record<keyof ObservabilityFilters, string>> = {
  from: 'From',
  to: 'To',
  search: 'Search',
  user_id: 'User',
  admin_id: 'Admin',
  ip: 'IP',
  asn: 'ASN',
  country: 'Country',
  route: 'Route',
  payment_reference: 'Payment ref',
  host: 'Host',
  container: 'Container',
  incident_id: 'Incident',
  severity: 'Severity',
  domain: 'Domain',
  category: 'Category',
  outcome: 'Outcome',
  actor_type: 'Actor',
};

export function FilterChipBar({ filters, onApply, onReset, className }: FilterChipBarProps) {
  const chips = useMemo<FilterChip[]>(() => {
    const out: FilterChip[] = [];
    for (const key of LIST_KEYS) {
      const values = filters[key] as string[];
      if (!values) continue;
      for (const value of values) {
        out.push({
          key: `${key}:${value}`,
          label: `${LABELS[key] ?? key}: ${value}`,
          onRemove: () => onApply({ [key]: values.filter((v) => v !== value) } as Partial<ObservabilityFilters>),
        });
      }
    }
    for (const key of TEXT_KEYS) {
      const value = filters[key] as string | undefined;
      if (!value) continue;
      out.push({
        key: `${key}:${value}`,
        label: `${LABELS[key] ?? key}: ${value}`,
        onRemove: () => onApply({ [key]: undefined } as Partial<ObservabilityFilters>),
      });
    }
    return out;
  }, [filters, onApply]);

  if (chips.length === 0) {
    return (
      <div className={cn('text-xs text-muted-foreground', className)}>No filters applied.</div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-foreground hover:bg-muted"
        >
          <span>{chip.label}</span>
          <X className="h-3 w-3 opacity-70" />
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
