'use client';

import { ObservabilityShell } from './_v2/ObservabilityShell';

/**
 * Admin Observability — v2.
 *
 * The previous 782-line flat-tab implementation was replaced with a SOC-style shell:
 * left rail (5 consolidated sections) + header (filters / time range / live refresh) +
 * centre work surface + right-side slide-over for drill-in. All data access happens
 * through hooks in `src/lib/observability`, and presentation lives under
 * `src/components/admin/observability/primitives` + `./_v2/sections/*`.
 *
 * See `OBSERVABILITY_REBUILD_PLAN.md` at the repo root for the full rationale.
 */
export default function ObservabilityPage() {
  return <ObservabilityShell />;
}
