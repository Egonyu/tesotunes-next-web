'use client';

import { useEffect, useRef, useState } from 'react';
import { Coins, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Live earnings panel for the Ateso corpus contribution flow.
 *
 * Two figures, both sourced from the profile API so they survive a refresh:
 *  - `lifetime`       — credits actually settled (accepted work), withdrawable after KYC.
 *  - `pendingCredits` — estimated credits for submitted-but-not-yet-accepted work.
 *  - `pendingCount`   — how many submissions make up that pending estimate.
 *
 * Earlier versions kept the pending figure in React state, so it reset to 0 on
 * every reload and looked like earnings were "disappearing". It is now server-backed.
 */

const EASE = (t: number) => 1 - Math.pow(1 - t, 3);

/** Animate a number toward `target` whenever it changes. */
function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(from + (target - from) * EASE(t)));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function encouragement(lifetime: number, pendingCount: number): string {
  if (lifetime >= 1500) return "You're on fire 🔥 every accepted line teaches the machine Ateso.";
  if (lifetime > 0) return 'Great momentum — your accepted lines have settled to real credits.';
  if (pendingCount > 0) return 'Nice work — your submissions settle to credits once peers review them.';
  return 'Translate or review a line to start earning credits.';
}

export function EarningsTicker({
  lifetime,
  pendingCount,
  pendingCredits,
}: {
  lifetime: number;
  pendingCount: number;
  pendingCredits: number;
}) {
  const animatedLifetime = useCountUp(lifetime);
  const animatedPending = useCountUp(pendingCredits);

  // Flash a "+N" badge each time the pending estimate grows (e.g. after a submit
  // triggers a profile refetch).
  const prev = useRef(pendingCredits);
  const flashId = useRef(0);
  const [flash, setFlash] = useState<{ amount: number; key: number } | null>(null);

  useEffect(() => {
    const delta = pendingCredits - prev.current;
    prev.current = pendingCredits;
    if (delta > 0) {
      flashId.current += 1;
      const key = flashId.current;
      setFlash({ amount: delta, key });
      const timer = setTimeout(() => {
        setFlash((f) => (f && f.key === key ? null : f));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pendingCredits]);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-amber-50 via-card to-primary/5 p-5 dark:from-amber-950/30">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15">
          <Coins className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Credits earned
          </p>
          <p className="text-2xl font-bold tabular-nums">{animatedLifetime.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground">settled — withdrawable after KYC</p>
        </div>
      </div>

      {/* Pending peer review — persistent, from the profile API. */}
      <div className="relative mt-4 rounded-xl border bg-background/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium">
            <Clock className="h-4 w-4 text-muted-foreground" /> Pending peer review
          </span>
          <span
            className={cn(
              'text-xl font-bold tabular-nums transition-colors',
              pendingCount > 0 ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {animatedPending.toLocaleString()} cr
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {pendingCount > 0
            ? `${pendingCount.toLocaleString()} submission${pendingCount === 1 ? '' : 's'} awaiting review — settles to credits once accepted.`
            : 'Submitted work waiting on review will show here.'}
        </p>

        {flash && (
          <span
            key={flash.key}
            className="pointer-events-none absolute right-4 top-3 inline-flex items-center gap-0.5 text-sm font-bold text-emerald-500 motion-safe:animate-[earnPop_1.4s_ease-out_forwards]"
          >
            <Sparkles className="h-3.5 w-3.5" /> +{flash.amount}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{encouragement(lifetime, pendingCount)}</p>

      {/* Local keyframes for the float-up flash. */}
      <style jsx>{`
        @keyframes earnPop {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.9);
          }
          25% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-18px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
