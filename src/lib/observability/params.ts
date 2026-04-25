import type { ObservabilityFilters } from '@/types/observability';

/**
 * Serialize an ObservabilityFilters object into the shape our axios `params` option
 * expects. Empty strings / empty arrays are dropped so the backend doesn't receive
 * `?severity=` noise. Arrays are preserved (axios serializes them as repeated params).
 */
export function paramsFromFilters(
  filters: ObservabilityFilters,
  extra?: Record<string, string | number | undefined>,
): Record<string, string | number | string[]> {
  const out: Record<string, string | number | string[]> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      if (value.length > 0) out[key] = value;
      continue;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      out[key] = value;
    }
  }

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined || value === null || value === '') continue;
      out[key] = value;
    }
  }

  return out;
}
