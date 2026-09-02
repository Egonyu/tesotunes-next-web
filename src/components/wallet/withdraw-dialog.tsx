'use client';

import { useState } from 'react';
import { ArrowUpCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { AmountField, amountProblem } from '@/components/wallet/amount-field';

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
  const [amount, setAmount] = useState(0);
  const [phone, setPhone] = useState('');

  const phoneDigits = phone.replace(/\D/g, '');
  const problem = amountProblem(amount, MIN_WITHDRAWAL, balance);

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
    setAmount(0);
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

        <AmountField
          id="withdraw-amount"
          value={amount}
          onChange={setAmount}
          min={MIN_WITHDRAWAL}
          max={balance}
          presets={PRESETS}
          disabled={isSubmitting}
        />

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
