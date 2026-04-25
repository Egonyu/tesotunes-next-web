'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDetailSlideOver } from './DetailSlideOverContext';

/**
 * Placeholder renderer. Detail-specific renderers (event / attacker / session / payment /
 * stakeholder / incident) are wired in during per-section migrations. Until then we show
 * the seed payload + any known identifier so the interaction loop is testable.
 */
export function DetailSlideOver() {
  const { selection, isOpen, close } = useDetailSlideOver();

  // Close on Esc.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          'fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Pane */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={selection ? `${selection.kind} detail` : 'Detail'}
        className={cn(
          'fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[480px] flex-col border-l bg-background shadow-xl transition-transform',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex items-center justify-between border-b px-5 py-3">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {selection?.kind.replace(/-/g, ' ') ?? 'Detail'}
            </p>
            <h3 className="text-base font-semibold">{selection?.label ?? selection?.id ?? 'Select an item'}</h3>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close detail pane"
            className="rounded-md border px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm">
          {selection ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Detail renderer for <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{selection.kind}</code>{' '}
                not yet wired. It will land with the matching section migration.
              </p>
              {selection.seed != null ? (
                <pre className="max-h-[60vh] overflow-auto rounded-lg border bg-muted/30 p-3 text-[11px] leading-relaxed">
                  {JSON.stringify(selection.seed, null, 2)}
                </pre>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
