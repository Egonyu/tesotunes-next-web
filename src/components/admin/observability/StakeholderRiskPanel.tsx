'use client';

import type { StakeholderRiskRow } from '@/types/observability';

export function StakeholderRiskPanel({
  actors,
  onSelect,
}: {
  actors: StakeholderRiskRow[];
  onSelect?: (actor: StakeholderRiskRow) => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Stakeholder Risk</h3>
      <div className="mt-4 space-y-3">
        {actors.slice(0, 8).map((actor) => (
          <button
            key={`${actor.actor_type}:${actor.actor_id}`}
            type="button"
            onClick={() => onSelect?.(actor)}
            aria-label={`Open stakeholder ${actor.label}`}
            className="w-full rounded-xl border px-4 py-3 text-left transition hover:border-foreground/20"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{actor.label}</p>
                <p className="text-xs text-muted-foreground">{actor.actor_type} {actor.email ? `• ${actor.email}` : ''}</p>
              </div>
              <span className="text-sm font-semibold">{actor.risk_score}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {actor.total_events} events • {actor.payment_events} payment touches • {actor.successful_suspicious_events} suspicious successes
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
