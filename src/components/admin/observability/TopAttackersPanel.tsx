'use client';

import type { AttackerRow } from '@/types/observability';

export function TopAttackersPanel({ attackers, onSelect }: { attackers: AttackerRow[]; onSelect?: (attacker: AttackerRow) => void }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Top Attackers</h3>
      <div className="mt-4 space-y-3">
        {attackers.slice(0, 8).map((attacker) => (
          <button
            key={attacker.id}
            onClick={() => onSelect?.(attacker)}
            className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">{attacker.label}</p>
              <p className="text-xs text-muted-foreground">{attacker.attempts} attempts • {attacker.successful} successful</p>
            </div>
            <span className="text-sm font-semibold">{attacker.risk_score}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
