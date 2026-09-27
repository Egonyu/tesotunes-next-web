'use client';

import { useState } from 'react';
import { KeyRound, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api';
import {
  useChangeWalletPin,
  useResetWalletPin,
  useWalletPinStatus,
} from '@/hooks/useWalletPin';
import { WalletPinModal } from '@/components/wallet/wallet-pin-modal';

/**
 * Lets a user set or change their wallet PIN from Settings, rather than only
 * discovering it when a transaction is blocked.
 */
export function WalletPinSettings() {
  const { data: status, isLoading } = useWalletPinStatus();
  const changePin = useChangeWalletPin();
  const resetPin = useResetWalletPin();

  const [setupOpen, setSetupOpen] = useState(false);
  const [changing, setChanging] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [password, setPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const length = status?.pin_length ?? 4;
  const hasPin = status?.has_pin ?? false;

  const submitChange = async () => {
    if (newPin !== confirmPin) {
      toast.error('The two new PINs do not match.');
      return;
    }

    try {
      await changePin.mutateAsync({ current_pin: currentPin, pin: newPin });
      toast.success('Wallet PIN updated.');
      setChanging(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (e) {
      const data = isApiError(e)
        ? (e.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined)
        : undefined;
      const first = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
      toast.error(first ?? data?.message ?? 'Could not update your PIN.');
    }
  };

  const clearForm = () => {
    setCurrentPin('');
    setPassword('');
    setNewPin('');
    setConfirmPin('');
  };

  const submitReset = async () => {
    if (newPin !== confirmPin) {
      toast.error('The two new PINs do not match.');
      return;
    }

    try {
      await resetPin.mutateAsync({ password, pin: newPin });
      toast.success('Wallet PIN reset. Use your new PIN for the next wallet action.');
      setResetting(false);
      clearForm();
    } catch (e) {
      const data = isApiError(e)
        ? (e.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined)
        : undefined;
      const first = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
      toast.error(first ?? data?.message ?? 'Could not reset your PIN.');
    }
  };

  const pinInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
  ) => {
    const id = `wallet-${label.toLowerCase().replaceAll(' ', '-')}`;

    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm text-muted-foreground">
          {label}
        </label>
        <input
          id={id}
          type="password"
          inputMode="numeric"
          maxLength={length}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
          className="w-full rounded-lg border bg-background px-3 py-2 tracking-[0.5em]"
          placeholder={'•'.repeat(length)}
        />
      </div>
    );
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">Wallet PIN</h3>
          <p className="text-sm text-muted-foreground">
            A {length}-digit PIN that authorizes withdrawals, transfers and purchases.
          </p>
        </div>
        {!isLoading && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              hasPin
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-amber-500/10 text-amber-600'
            }`}
          >
            {hasPin ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
            {hasPin ? 'Active' : 'Not set'}
          </span>
        )}
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : !hasPin ? (
        <button
          onClick={() => setSetupOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Set up PIN
        </button>
      ) : changing ? (
        <div className="space-y-3">
          {pinInput('Current PIN', currentPin, setCurrentPin)}
          {pinInput('New PIN', newPin, setNewPin)}
          {pinInput('Confirm new PIN', confirmPin, setConfirmPin)}
          <div className="flex gap-2 pt-1">
            <button
              onClick={submitChange}
              disabled={
                changePin.isPending ||
                currentPin.length !== length ||
                newPin.length !== length ||
                confirmPin.length !== length
              }
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {changePin.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save new PIN
            </button>
            <button
              onClick={() => {
                setChanging(false);
                clearForm();
              }}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : resetting ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-muted-foreground">
            Forgot your PIN? Confirm your account password, then choose a new one. You do not
            need the old PIN.
          </div>
          <div>
            <label
              htmlFor="wallet-account-password"
              className="mb-1 block text-sm text-muted-foreground"
            >
              Account password
            </label>
            <input
              id="wallet-account-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2"
              placeholder="Enter your account password"
            />
          </div>
          {pinInput('New PIN', newPin, setNewPin)}
          {pinInput('Confirm new PIN', confirmPin, setConfirmPin)}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button
              onClick={submitReset}
              disabled={
                resetPin.isPending ||
                !password ||
                newPin.length !== length ||
                confirmPin.length !== length
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {resetPin.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset PIN securely
            </button>
            <button
              onClick={() => {
                setResetting(false);
                clearForm();
              }}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => setChanging(true)}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Change PIN
          </button>
          <button
            onClick={() => setResetting(true)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Forgot PIN?
          </button>
        </div>
      )}

      <WalletPinModal
        open={setupOpen}
        challenge="setup_required"
        onClose={() => setSetupOpen(false)}
        onUnlocked={() => toast.success('Wallet PIN set.')}
      />
    </div>
  );
}
