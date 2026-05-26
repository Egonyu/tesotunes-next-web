'use client';

import { SecurityConsole } from './_console/SecurityConsole';

/**
 * Admin Security Console.
 *
 * Rebuilt from the ground up on a push-based pipeline: the Laravel
 * SecurityEventRecorder emits typed events at every security touchpoint, the
 * detection engine correlates them into incidents, and this page polls the
 * `/admin/observability/console/*` read API. The legacy `_v2` sync-on-read
 * shell has been retired.
 */
export default function ObservabilityPage() {
  return <SecurityConsole />;
}
