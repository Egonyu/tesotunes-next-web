'use client';

import type { ObservabilityEntity } from '@/types/observability';

interface IncidentEntityPivotsProps {
  entities: ObservabilityEntity[];
  onPivot: (entity: ObservabilityEntity) => void;
}

function pivotLabel(entity: ObservabilityEntity) {
  if (entity.entity_type === 'ip') return 'Open attacker view';
  if (entity.entity_type === 'session') return 'Open auth session view';
  if (entity.entity_type === 'payment_reference') return 'Open payment risk view';
  if (entity.entity_type === 'admin' || entity.entity_type === 'user') return 'Open audit trail';

  return 'Open related view';
}

export function IncidentEntityPivots({ entities, onPivot }: IncidentEntityPivotsProps) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Linked Entities</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Pivot from this incident into the most relevant investigation surface.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{entities.length} entities</span>
      </div>

      <div className="mt-4 space-y-3">
        {entities.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No linked entities available yet.
          </div>
        ) : entities.map((entity) => (
          <div key={entity.id} className="rounded-xl border px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{entity.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entity.entity_type} • risk {entity.risk_score}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onPivot(entity)}
                className="rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                {pivotLabel(entity)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
