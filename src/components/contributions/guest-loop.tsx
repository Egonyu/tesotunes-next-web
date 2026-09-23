'use client';

/**
 * The guest loop — the unauthenticated front door to /contribute.
 *
 * Five beats: type → see → judge → fix → again. No pitch and no example failure
 * up front; the visitor breaks the translator with their own words, which is a
 * far stronger argument than being told it is broken. The explanation of *why*
 * only appears once they have corrected it a few times, when it answers a
 * question they are actually asking.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Loader2, RefreshCw, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DIALECTS,
  useGuestSession,
  useGuestSuggestions,
  useGuestTranslate,
  useGuestVerdict,
  type GuestAttempt,
  type GuestDirection,
} from '@/hooks/useContributions';

const MAX_CHARS = 500;
/** Corrections made before the page explains itself. */
const REVEAL_AFTER = 3;

type Phase = 'compose' | 'judging' | 'correcting';

export function GuestLoop({ onWantAccount }: { onWantAccount?: () => void }) {
  const { data: session } = useGuestSession();
  const { data: suggestions, refetch: reshuffle } = useGuestSuggestions(1);
  const translate = useGuestTranslate();
  const verdict = useGuestVerdict();

  const [direction, setDirection] = useState<GuestDirection>('teo_to_en');
  const [text, setText] = useState('');
  const [attempt, setAttempt] = useState<GuestAttempt | null>(null);
  const [correction, setCorrection] = useState('');
  const [dialect, setDialect] = useState<string>('');
  const [done, setDone] = useState(0);
  const [phase, setPhase] = useState<Phase>('compose');

  const composeRef = useRef<HTMLTextAreaElement>(null);
  const correctionRef = useRef<HTMLTextAreaElement>(null);

  const suggestion = suggestions?.[0];

  useEffect(() => {
    if (phase === 'correcting') correctionRef.current?.focus();
  }, [phase]);

  const reset = useCallback(() => {
    setAttempt(null);
    setCorrection('');
    setDialect('');
    setText('');
    setPhase('compose');
    composeRef.current?.focus();
  }, []);

  const runTranslate = useCallback(
    async (value: string, origin: 'typed' | 'suggested') => {
      const trimmed = value.trim();
      if (!trimmed || translate.isPending) return;
      try {
        const result = await translate.mutateAsync({ text: trimmed, direction, origin });
        setAttempt(result);
        setPhase('judging');
      } catch {
        /* toast already raised by the hook */
      }
    },
    [direction, translate]
  );

  const recordVerdict = useCallback(
    async (value: 'correct' | 'wrong' | 'skipped') => {
      if (!attempt) return;

      if (value === 'wrong' && phase === 'judging') {
        setPhase('correcting');
        return;
      }

      try {
        await verdict.mutateAsync({
          uuid: attempt.uuid,
          verdict: value,
          correction: value === 'wrong' ? correction.trim() || undefined : undefined,
          dialect: dialect || undefined,
        });
        if (value !== 'skipped') setDone((n) => n + 1);
      } catch {
        return;
      }
      reset();
    },
    [attempt, correction, dialect, phase, reset, verdict]
  );

  const targetLabel = direction === 'teo_to_en' ? 'English' : 'Ateso';
  const busy = translate.isPending;

  return (
    <div className="mx-auto w-full max-w-xl space-y-4">
      {/* ── Compose ─────────────────────────────────────────── */}
      {phase === 'compose' && (
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight">Say something in Ateso.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We will try to translate it. It will probably get it wrong.
          </p>

          <div
            role="group"
            aria-label="Translation direction"
            className="mt-4 flex gap-1 rounded-lg border bg-muted/40 p-1"
          >
            {(
              [
                ['teo_to_en', 'Ateso → English'],
                ['en_to_teo', 'English → Ateso'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDirection(value)}
                aria-pressed={direction === value}
                className={cn(
                  'flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                  direction === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <label htmlFor="guest-source" className="sr-only">
            Text to translate
          </label>
          <textarea
            id="guest-source"
            ref={composeRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            rows={3}
            placeholder={direction === 'teo_to_en' ? 'Ejaasi itemwan ngul…' : 'Type anything…'}
            className="mt-3 w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {suggestion && (
            <button
              type="button"
              onClick={() => {
                setDirection(suggestion.direction);
                setText(suggestion.text);
                void runTranslate(suggestion.text, 'suggested');
              }}
              className="mt-2 flex w-full items-start gap-2 rounded-lg border border-dashed p-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="flex-1 line-clamp-2">Not sure? Try &ldquo;{suggestion.text}&rdquo;</span>
              <RefreshCw
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  void reshuffle();
                }}
              />
            </button>
          )}

          <button
            type="button"
            disabled={!text.trim() || busy}
            onClick={() => void runTranslate(text, 'typed')}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Translating&hellip;
              </>
            ) : (
              'Translate'
            )}
          </button>
          {busy && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              This runs on a small free server and takes a few seconds.
            </p>
          )}
        </div>
      )}

      {/* ── Judge / correct ─────────────────────────────────── */}
      {attempt && phase !== 'compose' && (
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
            You wrote
          </p>
          <p className="mt-1 text-sm">{attempt.source_text}</p>

          <div className="mt-3 rounded-lg border-l-4 border-primary bg-muted/40 p-3">
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-primary">
              {targetLabel}
            </p>
            <p className="mt-1 text-[0.95rem] leading-snug">{attempt.translation}</p>
          </div>

          {phase === 'judging' && (
            <>
              <p className="mt-4 text-sm font-medium">Is this right?</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={verdict.isPending}
                  onClick={() => void recordVerdict('correct')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-600/40 py-2.5 text-sm font-semibold text-emerald-600 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" /> Yes
                </button>
                <button
                  type="button"
                  disabled={verdict.isPending}
                  onClick={() => void recordVerdict('wrong')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-destructive/40 py-2.5 text-sm font-semibold text-destructive disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> No
                </button>
              </div>
              <button
                type="button"
                onClick={() => void recordVerdict('skipped')}
                className="mt-2 w-full py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Skip this one
              </button>
            </>
          )}

          {phase === 'correcting' && (
            <>
              <label
                htmlFor="guest-correction"
                className="mt-4 block text-sm font-medium"
              >
                What should it say?
              </label>
              <textarea
                id="guest-correction"
                ref={correctionRef}
                value={correction}
                onChange={(e) => setCorrection(e.target.value.slice(0, MAX_CHARS))}
                rows={2}
                placeholder={`The correct ${targetLabel}…`}
                className="mt-2 w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />

              {direction === 'en_to_teo' && (
                <>
                  <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
                    Which Ateso is yours?
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {DIALECTS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDialect(dialect === d.value ? '' : d.value)}
                        aria-pressed={dialect === d.value}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors',
                          dialect === d.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:border-primary/50'
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Ateso differs by area. A different answer is a{' '}
                    <span className="font-medium text-primary">variant</span>, not a wrong answer.
                  </p>
                </>
              )}

              <button
                type="button"
                disabled={!correction.trim() || verdict.isPending}
                onClick={() => void recordVerdict('wrong')}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {verdict.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Save and try another <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => void recordVerdict('skipped')}
                className="mt-2 w-full py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                I am not sure &mdash; skip
              </button>
            </>
          )}
        </div>
      )}

      {/* ── The reveal, once they have earned the explanation ── */}
      {done >= REVEAL_AFTER && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
          <h3 className="text-base font-semibold">
            You have corrected it {done} time{done === 1 ? '' : 's'}.
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            It is not broken. It has only ever read one book, and that book is 65 years old.
            Nobody has written enough Ateso down for a computer to learn from.
          </p>

          <div className="mt-3 space-y-1.5" aria-hidden="true">
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-right text-[0.65rem] text-muted-foreground">Ateso</span>
              <div className="h-4 flex-1 overflow-hidden rounded-sm border bg-muted/40">
                <div className="h-full w-[3px] bg-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-right text-[0.65rem] text-muted-foreground">English</span>
              <div className="h-4 flex-1 overflow-hidden rounded-sm border bg-muted/40">
                <div className="h-full w-full bg-gradient-to-r from-primary via-primary to-transparent" />
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            At this scale the English bar runs on for{' '}
            <span className="font-medium text-primary">28.5 km</span>. Your corrections are now part
            of the short one.
          </p>

          {onWantAccount && (
            <button
              type="button"
              onClick={onWantAccount}
              className="mt-3 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Sign in and keep my work
            </button>
          )}
        </div>
      )}

      {/* ── Collective tally. Never reads zero on arrival. ───── */}
      {session && (
        <p className="text-center text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{session.my_contributions}</span> from you
          {' · '}
          <span className="font-medium text-foreground">{session.total_contributions}</span> from
          everyone
        </p>
      )}
    </div>
  );
}
