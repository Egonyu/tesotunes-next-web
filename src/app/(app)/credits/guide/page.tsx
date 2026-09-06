'use client';

import Link from 'next/link';
import { ArrowLeft, Coins, Loader2, ShieldQuestion, Wallet } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import {
  useCreditsGuide,
  type CreditGuideRate,
} from '@/hooks/useCreditsGuide';

/**
 * How credits work.
 *
 * Every rate, cap, cooldown and description here comes from credit_rates —
 * the table the rewards engine actually enforces. Nothing is retyped, so an
 * operator editing a rate changes this page with it. The grouping and the
 * plain-English framing are the only editorial decisions, and they live in the
 * API so this page and any other reader stay consistent.
 */
export default function CreditsGuidePage() {
  const { data, isLoading, isError } = useCreditsGuide();

  return (
    <div className="container mx-auto max-w-2xl space-y-6 py-6">
      <Link
        href="/credits"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Credits
      </Link>

      <header>
        <h1 className="text-2xl font-bold tracking-tight">How credits work</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Credits are TesoTunes money. You earn them by using the platform, spend them on music and
          promotion, or turn them into cash.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-4">
        <ol className="space-y-3">
          {[
            { n: 1, t: 'Earn', s: 'Contributing Ateso, listening, referrals, daily logins.' },
            { n: 2, t: 'Spend', s: 'Songs, tips to artists, promotion, award votes.' },
            { n: 3, t: 'Cash out', s: 'Convert to UGX, withdraw, or save it in SACCO.' },
          ].map((step) => (
            <li key={step.n} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                {step.n}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">{step.t}</span>
                <span className="block text-xs text-muted-foreground">{step.s}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm font-medium">We couldn&apos;t load the earning rates</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your connection and refresh the page.
          </p>
        </div>
      )}

      {data && (
        <section className="rounded-xl border bg-card p-4">
          <header className="mb-1 flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Every way to earn</h2>
          </header>
          {data.personalised && (
            <p className="mb-3 text-xs text-muted-foreground">
              Showing what you have left today.
            </p>
          )}

          <div className="space-y-5">
            {data.groups.map((group) => (
              <div key={group.key}>
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{group.blurb}</p>

                <div className="mt-2 divide-y">
                  {group.rates.map((rate) => (
                    <RateRow key={rate.activity_type} rate={rate} personalised={data.personalised} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border bg-muted/40 p-4">
        <header className="mb-2 flex items-center gap-2">
          <ShieldQuestion className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Why an action stops paying</h2>
        </header>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Daily caps</span> stop one activity being
          farmed. Each has its own ceiling, so hitting the limit on likes doesn&apos;t touch what you
          can still earn from sharing.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Cooldowns</span> stop the same action
          repeating instantly — the daily bonus is one claim every 24 hours, and a play has to be a
          real play.
        </p>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <header className="mb-2 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Turning credits into cash</h2>
        </header>
        <p className="text-sm text-muted-foreground">
          Credits convert to UGX at the posted rate, then withdraw to MTN MoMo or Airtel Money, or
          move straight into SACCO savings.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/credits"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go to my credits
          </Link>
          <Link
            href="/sacco/savings"
            className="rounded-full border px-4 py-2 text-xs font-semibold transition-colors hover:bg-muted/50"
          >
            Save on SACCO
          </Link>
        </div>
      </section>
    </div>
  );
}

/** The constraints on a rate, said once and in words. */
function limitLine(rate: CreditGuideRate): string | null {
  const parts: string[] = [];

  if (rate.daily_limit !== null) {
    parts.push(`up to ${formatNumber(rate.daily_limit)} a day`);
  }

  if (rate.cooldown_minutes) {
    parts.push(
      rate.cooldown_minutes >= 1440
        ? `once every ${Math.round(rate.cooldown_minutes / 1440)} day${rate.cooldown_minutes >= 2880 ? 's' : ''}`
        : `once every ${rate.cooldown_minutes} min`
    );
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join(' · ');
}

function RateRow({
  rate,
  personalised,
}: {
  rate: CreditGuideRate;
  personalised: boolean;
}) {
  const limits = limitLine(rate);
  const showRemaining =
    personalised && rate.remaining_today !== null && rate.remaining_today !== undefined;

  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5 first:pt-1.5 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug">{rate.label}</p>
        {rate.description && (
          <p className="text-xs leading-snug text-muted-foreground">{rate.description}</p>
        )}
        {limits && (
          <p className="text-xs leading-snug text-muted-foreground first-letter:uppercase">
            {limits}
          </p>
        )}
        {showRemaining && (
          <p className="mt-0.5 text-xs font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
            {formatNumber(rate.remaining_today as number)} left today
          </p>
        )}
      </div>

      <p className="shrink-0 text-right text-sm font-semibold tabular-nums">
        {formatNumber(rate.credits)}
        <span className="block text-[10px] font-normal text-muted-foreground">
          {rate.credits === 1 ? 'credit' : 'credits'}
        </span>
      </p>
    </div>
  );
}
