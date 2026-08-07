'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isApiError } from '@/lib/api';
import {
  useSetWalletPin,
  useVerifyWalletPin,
  useWalletPinStatus,
  type PinChallenge,
} from '@/hooks/useWalletPin';

/**
 * The wallet PIN prompt. One component covers both halves of the journey:
 * first-time setup (enter + confirm) and unlocking an existing PIN before a
 * money action. On success the caller's pending action is resumed.
 */

interface WalletPinModalProps {
  open: boolean;
  /** Which prompt to show. Defaults to the account's actual state. */
  challenge?: PinChallenge;
  onClose: () => void;
  /** Runs once the PIN is set/verified — resume the blocked action here. */
  onUnlocked?: () => void;
}

function PinBoxes({
  value,
  length,
  onChange,
  disabled,
  autoFocus,
}: {
  value: string;
  length: number;
  onChange: (next: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div
      className="relative"
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      {/* One real input holds the value; the boxes are its visual stand-in.
          This keeps mobile keyboards and paste working. */}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label={`${length}-digit PIN`}
        maxLength={length}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <div className="pointer-events-none flex justify-center gap-3">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl font-bold transition-colors',
              i === value.length && !disabled
                ? 'border-primary bg-primary/5'
                : 'border-border bg-muted/40',
            )}
          >
            {value[i] ? '•' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

export function WalletPinModal({ open, challenge, onClose, onUnlocked }: WalletPinModalProps) {
  const { data: status } = useWalletPinStatus({ enabled: open });
  const setPin = useSetWalletPin();
  const verifyPin = useVerifyWalletPin();

  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState<string | null>(null);

  const length = status?.pin_length ?? 4;
  const mode: PinChallenge = useMemo(() => {
    if (challenge) return challenge;
    if (status?.is_locked) return 'locked';
    return status?.has_pin ? 'verification_required' : 'setup_required';
  }, [challenge, status]);

  // Reset whenever the modal is reopened so a stale PIN never lingers on screen.
  useEffect(() => {
    if (open) {
      setPinValue('');
      setConfirmPin('');
      setStage('enter');
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const pending = setPin.isPending || verifyPin.isPending;

  const readError = (e: unknown, fallback: string): string => {
    if (isApiError(e)) {
      const data = e.response?.data as
        | { message?: string; errors?: Record<string, string[]>; data?: { remaining_attempts?: number } }
        | undefined;
      const first = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
      const left = data?.data?.remaining_attempts;
      const base = first ?? data?.message ?? fallback;
      return typeof left === 'number' && left > 0 ? `${base} ${left} attempt(s) left.` : base;
    }
    return fallback;
  };

  const handleSubmit = async () => {
    setError(null);

    if (mode === 'setup_required') {
      if (stage === 'enter') {
        if (pin.length !== length) return;
        setStage('confirm');
        return;
      }

      if (confirmPin !== pin) {
        setError('The two PINs do not match.');
        setConfirmPin('');
        return;
      }

      try {
        await setPin.mutateAsync(pin);
        onUnlocked?.();
        onClose();
      } catch (e) {
        setError(readError(e, 'Could not set your PIN. Please try again.'));
        setStage('enter');
        setPinValue('');
        setConfirmPin('');
      }
      return;
    }

    if (pin.length !== length) return;

    try {
      await verifyPin.mutateAsync(pin);
      onUnlocked?.();
      onClose();
    } catch (e) {
      setError(readError(e, 'That PIN is incorrect.'));
      setPinValue('');
    }
  };

  const copy = {
    setup_required: {
      title: 'Set Up Your Wallet PIN',
      body: `Create a ${length}-digit PIN to secure your wallet transactions`,
      label: stage === 'enter' ? `Enter ${length}-Digit PIN` : 'Confirm Your PIN',
      cta: stage === 'enter' ? 'Continue' : 'Set PIN',
    },
    verification_required: {
      title: 'Enter Your Wallet PIN',
      body: 'Confirm this transaction with your PIN',
      label: `Enter ${length}-Digit PIN`,
      cta: 'Confirm',
    },
    locked: {
      title: 'Wallet Locked',
      body: 'Too many incorrect attempts. Please try again shortly.',
      label: '',
      cta: 'Close',
    },
  }[mode];

  const activeValue = mode === 'setup_required' && stage === 'confirm' ? confirmPin : pin;
  const setActiveValue = mode === 'setup_required' && stage === 'confirm' ? setConfirmPin : setPinValue;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">{copy.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.body}</p>
        </div>

        {mode !== 'locked' && (
          <div className="mb-5">
            <p className="mb-3 text-sm font-medium">{copy.label}</p>
            <PinBoxes
              value={activeValue}
              length={length}
              onChange={(next) => {
                setActiveValue(next);
                setError(null);
              }}
              disabled={pending}
              autoFocus
            />
          </div>
        )}

        {error && (
          <p className="mb-4 text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <button
          onClick={mode === 'locked' ? onClose : handleSubmit}
          disabled={pending || (mode !== 'locked' && activeValue.length !== length)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {copy.cta}
        </button>

        {mode === 'verification_required' && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Your PIN keeps your money safe. Never share it with anyone.
          </p>
        )}
      </div>
    </div>
  );
}
