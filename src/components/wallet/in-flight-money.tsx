'use client';

import { Clock, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InFlightPayment } from '@/hooks/usePayments';

/**
 * Money the user has committed that has not landed yet.
 *
 * Mobile money on a patchy network fails in ways that look, from the user's
 * side, like the money simply vanished — a top-up once sat in processing for
 * over 30 days with nothing on screen to explain it. Every in-transit and
 * recently-failed payment gets a visible resting state here: what it was, how
 * long it has been going, and if it failed, why.
 */

const TYPE_LABELS: Record<string, string> = {
  wallet_topup: 'Adding money',
  withdrawal: 'Cashing out',
  credits_purchase: 'Buying credits',
  credits_sale: 'Selling credits',
};

function label(payment: InFlightPayment): string {
  return TYPE_LABELS[payment.type] ?? (payment.direction === 'out' ? 'Money out' : 'Money in');
}

function elapsed(hours: number): string {
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

function Row({ payment }: { payment: InFlightPayment }) {
  const failed = payment.status === 'failed';
  const Icon = failed ? XCircle : payment.is_stale ? AlertTriangle : Clock;

  const tone = failed
    ? 'border-red-500/30 bg-red-500/5'
    : payment.is_stale
      ? 'border-amber-500/30 bg-amber-500/5'
      : 'border-border bg-muted/40';

  const iconTone = failed
    ? 'text-red-600 dark:text-red-400'
    : payment.is_stale
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-muted-foreground';

  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-3', tone)}>
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconTone)} aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {label(payment)} · {payment.currency} {payment.amount.toLocaleString()}
        </p>

        <p className="text-xs text-muted-foreground">
          {failed
            ? "Didn't go through"
            : payment.is_stale
              ? 'Still waiting on your provider'
              : 'On its way'}
          {' · '}
          {elapsed(payment.age_hours)}
          {payment.provider ? ` · ${payment.provider}` : ''}
        </p>

        {/* The provider's own words, so "where is my money" has an answer. */}
        {failed && payment.failure_reason && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{payment.failure_reason}</p>
        )}

        {!failed && payment.is_stale && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            This is taking longer than it should. Your money has not been lost — contact support with
            reference {payment.reference ?? 'from your history'} if it does not clear today.
          </p>
        )}
      </div>
    </div>
  );
}

export function InFlightMoney({ payments }: { payments: InFlightPayment[] }) {
  if (payments.length === 0) return null;

  return (
    <section aria-label="Money in flight" className="flex flex-col gap-2">
      {payments.map((payment, i) => (
        <Row key={payment.reference ?? `${payment.type}-${i}`} payment={payment} />
      ))}
    </section>
  );
}
