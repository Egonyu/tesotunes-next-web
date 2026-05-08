'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Activity, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings, useUpdateAudioQuality, QUALITY_LEVELS } from '@/hooks/useSettings';
import { useMySubscription } from '@/hooks/useSubscriptions';
import type { AudioSettings } from '@/hooks/useSettings';

/**
 * Returns the effective quality slug — user preference clamped to subscription cap.
 * Returns `undefined` while either query is still loading to prevent
 * premature URL resolution that would cause a mid-playback audio flip.
 */
export function useEffectiveQuality(): AudioSettings['quality_wifi'] | undefined {
  const { data: settings, isSuccess: settingsOk } = useSettings();
  const { data: sub, isSuccess: subOk } = useMySubscription();

  if (!settingsOk || !subOk) return undefined;

  const pref = settings?.audio?.quality_wifi;
  const preferenceKbps = QUALITY_LEVELS.find((q) => q.slug === pref)?.kbps ?? 128;
  const capKbps = sub?.limits?.audio_quality_kbps ?? 128;
  const effectiveKbps = Math.min(preferenceKbps, capKbps);

  if (effectiveKbps >= 320) return 'very_high';
  if (effectiveKbps >= 256) return 'high';
  if (effectiveKbps >= 128) return 'normal';
  return 'low';
}

const QUALITY_PARAM: Record<AudioSettings['quality_wifi'], string> = {
  low:       'low',
  normal:    'normal',
  high:      'high',
  very_high: 'very_high',
};

export function qualityParamFromSlug(slug: AudioSettings['quality_wifi']): string {
  return QUALITY_PARAM[slug] ?? 'normal';
}

export function StreamingQualityPicker() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: settings } = useSettings();
  const { data: sub } = useMySubscription();
  const updateQuality = useUpdateAudioQuality();

  const capKbps = sub?.limits?.audio_quality_kbps ?? 128;
  const currentSlug = settings?.audio?.quality_wifi ?? 'normal';
  const effectiveSlug = useEffectiveQuality();
  const effectiveLevel = QUALITY_LEVELS.find((q) => q.slug === effectiveSlug);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Streaming quality"
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold tabular-nums transition-colors',
          open
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
        )}
      >
        <Activity className="h-3.5 w-3.5 shrink-0" />
        <span>{effectiveLevel?.kbps ?? 128}k</span>
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-52 rounded-xl border bg-popover shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b">
            <p className="text-xs font-semibold">Streaming Quality</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Your plan allows up to {capKbps} kbps
            </p>
          </div>

          <div className="py-1">
            {QUALITY_LEVELS.map(({ slug, label, kbps }) => {
              const locked = kbps > capKbps;
              const active = currentSlug === slug && !locked;

              return (
                <button
                  key={slug}
                  disabled={locked || updateQuality.isPending}
                  onClick={() => {
                    if (!locked) {
                      updateQuality.mutate(slug);
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors',
                    locked
                      ? 'opacity-40 cursor-not-allowed'
                      : active
                        ? 'bg-primary/8 text-primary'
                        : 'hover:bg-muted/60',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{kbps} kbps</span>
                  </div>
                  {locked ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : active ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {capKbps < 320 && (
            <div className="border-t px-3 py-2">
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Upgrade for higher quality →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
