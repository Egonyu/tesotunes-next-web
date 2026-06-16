'use client';

import { Languages, Loader2, Check } from 'lucide-react';
import { useSongOptIn, useToggleSongOptIn } from '@/hooks/useContributions';

/**
 * Artist control to release a song's lyrics into the Ateso translation pool.
 * Renders nothing until the opt-in status resolves (the endpoint 404s when the
 * contributions module is disabled, which React Query surfaces as an error —
 * we simply hide the control in that case).
 */
export function LyricOptInToggle({ songId }: { songId: number }) {
  const { data, isLoading, isError } = useSongOptIn(songId);
  const { optIn, withdraw } = useToggleSongOptIn(songId);

  if (isLoading || isError || !data) return null;

  const busy = optIn.isPending || withdraw.isPending;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Languages className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">Ateso translation</p>
          <p className="text-sm text-muted-foreground">
            {data.opted_in
              ? `Opted in — ${data.tasks_generated} line(s) released to fans for translation.`
              : `Let fans translate this song's ${data.lyric_line_count} lyric line(s) and help build the Ateso corpus.`}
          </p>
        </div>
        {data.opted_in ? (
          <button
            onClick={() => withdraw.mutate()}
            disabled={busy}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
            Opted in
          </button>
        ) : (
          <button
            onClick={() => optIn.mutate()}
            disabled={busy || data.lyric_line_count === 0}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Opt in
          </button>
        )}
      </div>
    </div>
  );
}
