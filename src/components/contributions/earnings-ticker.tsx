'use client';

import { useEffect, useRef, useState } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Live earnings panel for the Ateso corpus contribution flow.
 *
 * Rather than flashing a bare "you earned X", it shows the *math*: how many
 * lines you translated and reviewed this session, each multiplied by its rate,
 * summed to an estimate. The total is framed as "pending peer review" because
 * credits only settle once a contribution is accepted.
 *
 *  - `lifetime` — credits actually settled (real, from the profile API).
 *  - `translations` / `reviews` — counts of work done this session.
 *  - `perTranslation` / `perReview` — the per-action rates (from backend config).
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

function MathRow({
  label,
  count,
  rate,
}: {
  label: string;
  count: number;
  rate: number;
}) {
  const dim = count === 0;
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 text-sm tabular-nums transition-opacity',
        dim && 'opacity-50'
      )}
    >
      <span className="text-muted-foreground">
        <span className="font-semibold text-foreground">{count.toLocaleString()}</span> {label}
        <span className="text-muted-foreground"> × {rate}</span>
      </span>
      <span className="font-medium">{(count * rate).toLocaleString()}</span>
    </div>
  );
}

function encouragement(total: number, anyWork: boolean): string {
  if (total >= 1500) return "You're on fire 🔥 every line teaches the machine Ateso.";
  if (total >= 600) return 'Great momentum — keep them coming!';
  if (anyWork) return 'Nice start — each accepted line settles to real credits.';
  return 'Translate or review a line to see your earnings add up.';
}

export function EarningsTicker({
  lifetime,
  translations,
  reviews,
  perTranslation,
  perReview,
}: {
  lifetime: number;
  translations: number;
  reviews: number;
  perTranslation: number;
  perReview: number;
}) {
  const estimate = translations * perTranslation + reviews * perReview;
  const anyWork = translations + reviews > 0;

  const animatedLifetime = useCountUp(lifetime);
  const animatedEstimate = useCountUp(estimate);

  // Flash a "+N" badge each time the estimate grows.
  const prev = useRef(estimate);
  const flashId = useRef(0);
  const [flash, setFlash] = useState<{ amount: number; key: number } | null>(null);

  useEffect(() => {
    const delta = estimate - prev.current;
    prev.current = estimate;
    if (delta > 0) {
      flashId.current += 1;
      const key = flashId.current;
      setFlash({ amount: delta, key });
      const timer = setTimeout(() => {
        setFlash((f) => (f && f.key === key ? null : f));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [estimate]);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-amber-50 via-card to-primary/5 p-5 dark:from-amber-950/30">
      <div className="flex items-center justify-between gap-3">
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
      </div>

      {/* The math: counts × rate, summed to a pending estimate. */}
      <div className="relative mt-4 rounded-xl border bg-background/60 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          This session
        </p>
        <div className="space-y-1.5">
          <MathRow label="translations" count={translations} rate={perTranslation} />
          <MathRow label="reviews" count={reviews} rate={perReview} />
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3 border-t pt-2.5">
          <span className="text-sm font-medium">Estimated</span>
          <span
            className={cn(
              'text-xl font-bold tabular-nums transition-colors',
              anyWork ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {animatedEstimate.toLocaleString()} cr
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Pending peer review — credits settle once contributions are accepted.
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

      <p className="mt-3 text-sm text-muted-foreground">{encouragement(estimate, anyWork)}</p>

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
