'use client';

import type { IncidentSuggestionRow } from '@/types/observability';

interface IncidentRecommendationsProps {
  suggestions: IncidentSuggestionRow[];
  onCreate: (suggestion: IncidentSuggestionRow) => void;
  isSaving?: boolean;
}

export function IncidentRecommendations({
  suggestions,
  onCreate,
  isSaving = false,
}: IncidentRecommendationsProps) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Suggested Incidents</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Auto-grouped high-risk events that are not yet attached to an incident.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{suggestions.length} suggestions</span>
      </div>

      <div className="mt-4 space-y-3">
        {suggestions.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No unassigned high-risk clusters right now.
          </div>
        ) : suggestions.map((suggestion) => (
          <div key={suggestion.suggestion_key} className="rounded-xl border px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{suggestion.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{suggestion.summary}</p>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => onCreate(suggestion)}
                className="rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create incident
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Severity: {suggestion.severity}</span>
              <span>Events: {suggestion.event_count}</span>
              <span>Risk: {suggestion.risk_score}</span>
            </div>
            {suggestion.top_routes.length > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Routes: {suggestion.top_routes.join(', ')}
              </p>
            ) : null}
            {suggestion.source_ips.length > 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Sources: {suggestion.source_ips.join(', ')}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
