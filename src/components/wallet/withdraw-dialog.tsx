'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpCircle, Loader2, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { AmountField, amountProblem } from '@/components/wallet/amount-field';
import type { WithdrawalTerms } from '@/hooks/usePayments';

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

/**
 * Keep in sync with config('payments.wallet_withdrawal.min_amount').
 * ZengaPay's per-transaction charge does not scale down — a measured 1,000 UGX
 * movement lost roughly 220 to fees — so the floor sits where charges stop
 * dominating the transfer.
 */
/**
 * The absolute floor, kept only as the fallback for callers without live terms.
 * The real floor for an account arrives from the API as WithdrawalTerms, since
 * it depends on whether the account carries a subscription.
 */
export const MIN_WITHDRAWAL = 5000;

const PRESETS = [5000, 10000, 25000, 50000];

const STEP_LABELS: Record<string, string> = {
  kyc_verified: 'Verify your identity',
  phone_verified: 'Confirm your phone number',
  payout_method: 'Add a mobile money number to your account',
};

/**
 * The API answers a gated withdrawal with the exact steps still outstanding.
 * Showing them beats a toast that just says the request was forbidden.
 */
function KycRequiredNotice({ steps, redirect }: { steps: string[]; redirect: string }) {
  return (
    <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="text-sm font-semibold">A few things first</p>
          <p className="text-xs text-muted-foreground">
            Cashing out needs these finished. Your money stays in your wallet meanwhile.
          </p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {steps.map((step) => (
          <li key={step} className="flex items-center gap-2 text-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
            {STEP_LABELS[step] ?? step.replace(/_/g, ' ')}
          </li>
        ))}
      </ul>

      <Link
        href={redirect}
        className="inline-flex w-full items-center justify-center rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Continue verification
      </Link>
    </div>
  );
}

export function WithdrawDialog({
  open,
  onClose,
  balance,
  onSubmit,
  isSubmitting,
  kycRequirement,
  terms,
}: {
  open: boolean;
  onClose: () => void;
  balance: number;
  onSubmit: (amount: number, phone: string) => void;
  isSubmitting: boolean;
  kycRequirement?: { missing_steps: string[]; redirect: string } | null;
  terms: WithdrawalTerms;
}) {
  const [amount, setAmount] = useState(0);
  const [phone, setPhone] = useState('');

  // The dialog stays mounted when it is hidden, so its own close() only ran
  // when the user dismissed it — a cash-out that succeeded left the last
  // amount and number sitting in the fields, and reopening showed them against
  // an already-debited balance. Clear on any close, whoever caused it.
  useEffect(() => {
    if (!open) {
      setAmount(0);
      setPhone('');
    }
  }, [open]);

  /*
   * The tier rule collapses to one number. An account below its tier floor may
   * still take everything out, so the floor drops to the balance — leaving the
   * whole balance as the only amount that passes. The absolute floor still
   * wins underneath, so a balance too small to be worth its fee is simply not
   * withdrawable, and says so rather than failing at the API.
   */
  const effectiveMin = Math.max(
    terms.absolute_minimum,
    Math.min(terms.tier_minimum, balance),
  );

  const phoneDigits = phone.replace(/\D/g, '');
  const problem = amountProblem(amount, effectiveMin, balance);

  const phoneProblem = phoneDigits.length > 0 && phoneDigits.length < 9
    ? 'Enter a full mobile money number, e.g. 0772 123 456.'
    : null;

  const canSubmit =
    !isSubmitting &&
    amount >= effectiveMin &&
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

        {kycRequirement && (
          <KycRequiredNotice
            steps={kycRequirement.missing_steps}
            redirect={kycRequirement.redirect}
          />
        )}

        <AmountField
          id="withdraw-amount"
          value={amount}
          onChange={setAmount}
          min={effectiveMin}
          max={balance}
          presets={PRESETS.filter((preset) => preset >= effectiveMin && preset <= balance)}
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
