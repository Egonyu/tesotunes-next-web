'use client';

import { useMemo, useState } from 'react';
import { ArrowUpCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';

/**
 * Cash-out dialog.
 *
 * Sending money out is the moment people are most anxious, and it was the
 * thinner of the two flows: an amount box, a phone box, and a button, with the
 * UGX 1,000 minimum only revealed after a failed attempt and no statement of
 * what would actually land. This mirrors the top-up summary — amount, fee,
 * what you receive — and states the limits up front.
 *
 * Withdrawals carry no fee: the API disburses the full amount and refunds the
 * wallet if the provider rejects it, so "you receive" equals the amount.
 */

export const MIN_WITHDRAWAL = 1000;

const PRESETS = [1000, 5000, 10000];

/** Digits only, so "50,000" and "50 000" both parse. */
function parseAmount(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits, 10);
}

function formatAmount(value: number): string {
  return value === 0 ? '' : value.toLocaleString();
}

export function WithdrawDialog({
  open,
  onClose,
  balance,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  balance: number;
  onSubmit: (amount: number, phone: string) => void;
  isSubmitting: boolean;
}) {
  const [amountText, setAmountText] = useState('');
  const [phone, setPhone] = useState('');

  const amount = parseAmount(amountText);
  const phoneDigits = phone.replace(/\D/g, '');

  const problem = useMemo(() => {
    if (amount === 0) return null;
    if (amount < MIN_WITHDRAWAL) return `The smallest cash out is UGX ${MIN_WITHDRAWAL.toLocaleString()}.`;
    if (amount > balance) return "That's more than your cash balance.";
    return null;
  }, [amount, balance]);

  const phoneProblem = phoneDigits.length > 0 && phoneDigits.length < 9
    ? 'Enter a full mobile money number, e.g. 0772 123 456.'
    : null;

  const canSubmit =
    !isSubmitting &&
    amount >= MIN_WITHDRAWAL &&
    amount <= balance &&
    phoneDigits.length >= 9;

  const close = () => {
    if (isSubmitting) return;
    setAmountText('');
    setPhone('');
    onClose();
  };

  return (
    <Modal open={open} onClose={close} labelledBy="withdraw-dialog-title">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="withdraw-dialog-title" className="text-xl font-bold">
              Cash out
            </h2>
            <p className="text-sm text-muted-foreground">
              Sent to your mobile money in a few minutes.
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="rounded-lg p-2 hover:bg-muted disabled:opacity-50"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">Cash balance</p>
          <p className="text-2xl font-bold tabular-nums">UGX {balance.toLocaleString()}</p>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label htmlFor="withdraw-amount" className="block text-sm font-medium">
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              UGX
            </span>
            <input
              id="withdraw-amount"
              // Numeric keypad on a phone — this is a money field on a
              // mobile-first product, not free text.
              inputMode="numeric"
              autoComplete="off"
              value={amountText}
              onChange={(e) => setAmountText(formatAmount(parseAmount(e.target.value)))}
              placeholder="0"
              aria-describedby="withdraw-amount-help"
              aria-invalid={problem !== null}
              className={cn(
                'w-full rounded-lg border bg-background py-3 pl-14 pr-4 text-lg font-semibold tabular-nums',
                problem && 'border-red-500'
              )}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.filter((p) => p <= balance).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmountText(formatAmount(preset))}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                {preset.toLocaleString()}
              </button>
            ))}
            {balance >= MIN_WITHDRAWAL && (
              <button
                type="button"
                onClick={() => setAmountText(formatAmount(balance))}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                All of it
              </button>
            )}
          </div>

          <p
            id="withdraw-amount-help"
            className={cn('text-xs', problem ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')}
          >
            {problem ?? `Minimum UGX ${MIN_WITHDRAWAL.toLocaleString()}.`}
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label htmlFor="withdraw-phone" className="block text-sm font-medium">
            Mobile money number
          </label>
          <input
            id="withdraw-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0772 123 456"
            aria-describedby="withdraw-phone-help"
            aria-invalid={phoneProblem !== null}
            className={cn(
              'w-full rounded-lg border bg-background px-4 py-3',
              phoneProblem && 'border-red-500'
            )}
          />
          <p
            id="withdraw-phone-help"
            className={cn('text-xs', phoneProblem ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')}
          >
            {phoneProblem ?? 'MTN or Airtel. The money is sent to this number.'}
          </p>
        </div>

        {/* What actually lands — mirrors the top-up summary. */}
        <div className="space-y-2 rounded-lg border p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="tabular-nums">UGX {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee</span>
            <span className="text-green-600 dark:text-green-400">Free</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>You receive</span>
            <span className="tabular-nums">UGX {amount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={close}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border py-3 font-medium hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(amount, phone)}
            disabled={!canSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <ArrowUpCircle className="h-5 w-5" />
                Cash out
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
