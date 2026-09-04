'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useWalletPinGuardState } from '@/hooks/useWalletPin';
import { WalletPinModal } from '@/components/wallet/wallet-pin-modal';

/**
 * One PIN prompt for the whole app.
 *
 * Six endpoints sit behind the wallet.pin middleware — cash-out, credit
 * transfer, tips, artist withdrawal, SACCO withdrawal and share transfer,
 * store checkout — and each answers 423 until the PIN window is open. Every
 * one of them needs to raise the same prompt and replay the same action.
 *
 * When that wiring lived in the pages, only /wallet ever did it. The other
 * five surfaced a raw "failed" toast with no way to enter a PIN, which made
 * those actions not merely awkward but impossible. Sending credits was broken
 * from the day the middleware was added.
 *
 * Holding the state here means a money action only has to call runGuarded.
 * There is no modal to remember to render, so the next surface to sit behind
 * that middleware cannot repeat this.
 */

type RunGuarded = <T>(action: () => Promise<T>) => Promise<T | undefined>;

const WalletPinContext = createContext<RunGuarded | null>(null);

export function WalletPinProvider({ children }: { children: ReactNode }) {
  const { runGuarded, pinModal } = useWalletPinGuardState();

  // runGuarded is already stable; memo keeps consumers from re-rendering when
  // the challenge state changes underneath them.
  const value = useMemo<RunGuarded>(() => runGuarded, [runGuarded]);

  return (
    <WalletPinContext.Provider value={value}>
      {children}
      <WalletPinModal {...pinModal} />
    </WalletPinContext.Provider>
  );
}

/**
 * Wrap a money action so a PIN challenge is handled for you.
 *
 *   const runGuarded = useWalletPinGuard();
 *   const result = await runGuarded(() => tip.mutateAsync(payload));
 *   if (result === undefined) return; // prompt dismissed, nothing happened
 *
 * Resolves with whatever the action returned once the PIN is accepted, and
 * with undefined if the prompt is dismissed — so a caller never hangs with its
 * submit button spinning.
 */
export function useWalletPinGuard(): RunGuarded {
  const runGuarded = useContext(WalletPinContext);

  if (!runGuarded) {
    throw new Error(
      'useWalletPinGuard needs a <WalletPinProvider> above it. It is mounted in the app and artist layouts.',
    );
  }

  return runGuarded;
}
