'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type DetailKind =
  | 'event'
  | 'attacker'
  | 'session'
  | 'payment'
  | 'stakeholder'
  | 'incident'
  | 'database-event'
  | 'system-event'
  | 'change-event';

export interface DetailSelection {
  kind: DetailKind;
  /** Primary identifier — can be a number, string, or composite (e.g. "user:42"). */
  id: string;
  /** Optional seed payload so the pane can render immediately before its detail query resolves. */
  seed?: unknown;
  /** Human-friendly label used in the pane header. */
  label?: string;
}

interface DetailSlideOverContextValue {
  selection: DetailSelection | null;
  open: (selection: DetailSelection) => void;
  close: () => void;
  isOpen: boolean;
}

const DetailSlideOverContext = createContext<DetailSlideOverContextValue | null>(null);

export function DetailSlideOverProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<DetailSelection | null>(null);

  const open = useCallback((next: DetailSelection) => setSelection(next), []);
  const close = useCallback(() => setSelection(null), []);

  const value = useMemo<DetailSlideOverContextValue>(
    () => ({ selection, open, close, isOpen: selection != null }),
    [selection, open, close],
  );

  return <DetailSlideOverContext.Provider value={value}>{children}</DetailSlideOverContext.Provider>;
}

export function useDetailSlideOver() {
  const ctx = useContext(DetailSlideOverContext);
  if (!ctx) {
    throw new Error('useDetailSlideOver must be used inside <DetailSlideOverProvider>');
  }
  return ctx;
}
