import { useCallback, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost, apiPut, isApiError } from '@/lib/api';

// Types mirror App\Http\Controllers\Api\Wallet\WalletPinController.

export interface WalletPinStatus {
  has_pin: boolean;
  is_locked: boolean;
  locked_until: string | null;
  remaining_attempts: number;
  session_unlocked: boolean;
  pin_length: number;
  session_minutes: number;
}

/** What the backend asks the UI to do when a money action is blocked (HTTP 423). */
export type PinChallenge = 'setup_required' | 'verification_required' | 'locked';

/**
 * Reads the 423 the wallet.pin middleware returns, so a money flow can raise the
 * right modal instead of surfacing a generic error.
 */
export function pinChallengeFrom(error: unknown): PinChallenge | null {
  if (!isApiError(error) || error.response?.status !== 423) return null;

  const status = (error.response?.data as { pin_status?: string } | undefined)?.pin_status;

  return status === 'setup_required' || status === 'verification_required' || status === 'locked'
    ? status
    : null;
}

export function useWalletPinStatus(options?: { enabled?: boolean }) {
  const { status } = useSession();

  return useQuery({
    queryKey: ['wallet', 'pin', 'status'],
    queryFn: () => apiGet<{ data: WalletPinStatus }>('/wallet/pin/status').then((r) => r.data),
    enabled: options?.enabled !== false && status === 'authenticated',
    staleTime: 30_000,
  });
}

export function useSetWalletPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pin: string) =>
      apiPost<{ data: { session_expires_at: string } }>('/wallet/pin', {
        pin,
        pin_confirmation: pin,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallet', 'pin'] }),
  });
}

export function useVerifyWalletPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pin: string) =>
      apiPost<{ data: { session_expires_at: string } }>('/wallet/pin/verify', { pin }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallet', 'pin'] }),
  });
}

export function useChangeWalletPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { current_pin: string; pin: string }) =>
      apiPut<{ message: string }>('/wallet/pin', {
        current_pin: input.current_pin,
        pin: input.pin,
        pin_confirmation: input.pin,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallet', 'pin'] }),
  });
}

export function useLockWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<{ message: string }>('/wallet/pin/lock', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallet', 'pin'] }),
  });
}

/**
 * Wraps a money action so a PIN challenge is handled transparently: if the
 * backend answers 423, the right modal is raised and the original action is
 * retried once the PIN is set or verified. Any other error is rethrown so the
 * caller keeps its own handling.
 *
 *   const { runGuarded, pinModal } = useWalletPinGuard();
 *   await runGuarded(() => withdraw.mutateAsync(payload));
 *   ...
 *   <WalletPinModal {...pinModal} />
 */
export function useWalletPinGuard() {
  const [challenge, setChallenge] = useState<PinChallenge | null>(null);
  const pendingAction = useRef<(() => Promise<unknown>) | null>(null);
  /**
   * Settles the caller's `await runGuarded(...)` once the retried action has
   * actually finished. Without this the retry ran fire-and-forget: a withdrawal
   * that needed a PIN really did move the money, but the caller had already
   * been handed `undefined` and taken its early-return, so the dialog never
   * closed, its fields were never cleared, and the freshly-lowered balance made
   * the stale amount read as "more than your available balance" — three
   * symptoms of one dropped promise.
   */
  const pendingSettle = useRef<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  } | null>(null);

  const runGuarded = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    try {
      return await action();
    } catch (error) {
      const needed = pinChallengeFrom(error);
      if (!needed) throw error;

      pendingAction.current = action as () => Promise<unknown>;
      setChallenge(needed);

      return new Promise<T | undefined>((resolve, reject) => {
        pendingSettle.current = { resolve: resolve as (value: unknown) => void, reject };
      });
    }
  }, []);

  const close = useCallback(() => {
    const settle = pendingSettle.current;
    pendingAction.current = null;
    pendingSettle.current = null;
    setChallenge(null);

    // Dismissing the PIN prompt abandons the action. Resolve rather than leave
    // the caller awaiting forever with its submit button stuck spinning; the
    // undefined lands on the same path as "nothing happened".
    settle?.resolve(undefined);
  }, []);

  const onUnlocked = useCallback(() => {
    const retry = pendingAction.current;
    const settle = pendingSettle.current;
    pendingAction.current = null;
    pendingSettle.current = null;
    setChallenge(null);

    if (!retry) {
      settle?.resolve(undefined);
      return;
    }

    retry().then(
      (value) => settle?.resolve(value),
      (error) => settle?.reject(error),
    );
  }, []);

  return {
    runGuarded,
    /** Spread straight onto <WalletPinModal />. */
    pinModal: {
      open: challenge !== null,
      challenge: challenge ?? undefined,
      onClose: close,
      onUnlocked,
    },
  };
}
