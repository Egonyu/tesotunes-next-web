'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, ChevronRight, Loader2 } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { cn, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { useCreditBalance, useExchangeCredits, usePurchaseCredits } from '@/hooks/usePayments';

/**
 * Credits.
 *
 * This page used to explain itself at length: a gradient hero, four stat
 * tiles, a "Listen & Earn" panel running to fifty lines, a "What Credits Are
 * For" grid, and a closing note about bonus credits. Someone who has opened
 * their credits page knows what credits are. The figures were all correct —
 * the tiers match PaymentObserver, the pool default really is 1,000 — so
 * nothing here is a correction, only the same facts said once and quietly.
 *
 * It follows /wallet: flat fills rather than gradients, short labels, figures
 * in tabular-nums, and prose only where it changes what somebody would do.
 */

interface CreditTransaction {
  id: number;
  type: string;
  amount: string;
  description: string;
  source: string;
  balance_after: string;
  date: string;
  relative_date: string;
}

interface CreditWallet {
  available_credits: number;
  total_earned: number;
  total_spent: number;
  earned_today: number;
  spent_today: number;
  login_streak: number;
  next_milestone: { credits_needed: number; reward: string } | null;
  recent_transactions: CreditTransaction[];
}

interface EarningOpportunity {
  title: string;
  description: string;
  potential_credits: string | number;
  daily_limit: string | number;
  remaining_today: string | number;
}

interface DailyChallenge {
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  completed: boolean;
}

interface CreditDashboard {
  wallet: CreditWallet;
  earning_opportunities: EarningOpportunity[];
  daily_challenges: DailyChallenge[];
}

/**
 * Types that put credits in rather than take them out.
 *
 * Both spellings appear because the model carries both — every row written so
 * far uses the longer one, and the short forms are kept until the duplicate
 * constants are retired. This list previously lacked 'earned' entirely, so a
 * purchase was coloured and signed as a withdrawal.
 */
const POSITIVE_TYPES = new Set([
  'earn',
  'earned',
  'bonus',
  'refund',
  'transfer_in',
  'daily_login_bonus',
  'wallet_purchase',
]);

/**
 * Top-up bonus bands, mirroring PaymentObserver::awardTopUpBonusCredits.
 * Kept because it is the one thing here that changes what someone does with
 * their money — a 10,000 top-up returns twice the bonus rate of a 5,000 one.
 */
const TOPUP_BONUS_BANDS = [
  { from: 5000, bonus: '+10%' },
  { from: 10000, bonus: '+20%' },
  { from: 20000, bonus: '+30%' },
  { from: 50000, bonus: '+40%' },
];

export default function CreditsPage() {
  const queryClient = useQueryClient();
  const [showHistory, setShowHistory] = useState(false);
  const [buyCredits, setBuyCredits] = useState('');
  const [cashoutCredits, setCashoutCredits] = useState('');

  const { data: balance } = useCreditBalance();
  const purchaseCredits = usePurchaseCredits();
  const exchangeCredits = useExchangeCredits();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['credits', 'dashboard'],
    queryFn: () =>
      apiGet<{ success: boolean; data: CreditDashboard }>('/credits/dashboard').then((res) => res.data),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['credits', 'transactions'],
    queryFn: () =>
      apiGet<{ success: boolean; transactions: { data: CreditTransaction[] } }>('/credits/transactions').then(
        (res) => res.transactions.data
      ),
    enabled: showHistory,
  });

  const claimBonus = useMutation({
    mutationFn: () => apiPost('/credits/claim-daily-bonus', {}),
    onSuccess: () => {
      toast.success('Daily bonus claimed.');
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
    onError: () => toast.error('Already claimed today, or not eligible.'),
  });

  const wallet = dashboard?.wallet;
  const opportunities = dashboard?.earning_opportunities ?? [];
  const challenges = dashboard?.daily_challenges ?? [];
  const transactions = showHistory ? transactionsData ?? [] : wallet?.recent_transactions ?? [];

  const ugxPerCredit = balance?.exchange_rate?.ugx_per_credit ?? 1;
  const buyValue = parseInt(buyCredits.replace(/\D/g, ''), 10) || 0;
  const cashoutValue = parseInt(cashoutCredits.replace(/\D/g, ''), 10) || 0;
  const buyCost = buyValue > 0 ? Math.max(1, Math.round(buyValue * ugxPerCredit)) : 0;
  const cashoutReturn = cashoutValue > 0 ? Math.max(1, Math.round(cashoutValue * ugxPerCredit)) : 0;

  const handleBuy = async () => {
    if (buyValue < 1) return;

    await purchaseCredits.mutateAsync(
      { credits_amount: buyValue },
      {
        onSuccess: () => {
          toast.success('Credits added.');
          setBuyCredits('');
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : 'Could not buy credits.'),
      }
    );
  };

  const handleCashout = async () => {
    if (cashoutValue < 1) return;

    await exchangeCredits.mutateAsync(
      { direction: 'credits_to_wallet', credits_amount: cashoutValue },
      {
        onSuccess: () => {
          toast.success('Moved to your wallet.');
          setCashoutCredits('');
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : 'Could not convert credits.'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Credits</h1>
        <Link href="/wallet" className="text-sm text-muted-foreground hover:text-foreground">
          Wallet
        </Link>
      </div>

      {/* Balance, matching the wallet card: flat fill, no gradient. */}
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Balance
        </p>
        <p className="mt-1 text-4xl font-bold tabular-nums">
          {formatNumber(wallet?.available_credits ?? 0)}
        </p>

        <div className="mt-4 flex items-baseline justify-between border-t border-primary/20 pt-3 text-sm">
          <span className="text-muted-foreground">Cash balance</span>
          <span className="font-semibold tabular-nums">
            UGX {(balance?.wallet_balance ?? 0).toLocaleString()}
          </span>
        </div>
        {(wallet?.earned_today ?? 0) > 0 && (
          <div className="mt-2 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Earned today</span>
            <span className="font-semibold tabular-nums">
              {formatNumber(wallet?.earned_today ?? 0)}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => claimBonus.mutate()}
          disabled={claimBonus.isPending}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {claimBonus.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Daily bonus
        </button>
        <Link
          href="/credits/transfer"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border bg-card px-4 font-medium transition-colors hover:bg-muted"
        >
          Send credits
        </Link>
      </div>

      {/* The two conversions, side by side because they are inverses. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-sm">Buy credits</h2>
          <input
            inputMode="numeric"
            value={buyCredits}
            onChange={(event) => setBuyCredits(event.target.value.replace(/\D/g, ''))}
            placeholder="Credits"
            className="w-full rounded-lg border bg-background px-3 py-2.5 tabular-nums"
          />
          <p className="text-sm text-muted-foreground">
            Costs <span className="font-medium text-foreground tabular-nums">UGX {buyCost.toLocaleString()}</span>
          </p>
          <button
            onClick={handleBuy}
            disabled={purchaseCredits.isPending || buyValue < 1}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
          >
            {purchaseCredits.isPending ? 'Working…' : 'Buy'}
          </button>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-sm">Move to wallet</h2>
          <input
            inputMode="numeric"
            value={cashoutCredits}
            onChange={(event) => setCashoutCredits(event.target.value.replace(/\D/g, ''))}
            placeholder="Credits"
            className="w-full rounded-lg border bg-background px-3 py-2.5 tabular-nums"
          />
          <p className="text-sm text-muted-foreground">
            You get <span className="font-medium text-foreground tabular-nums">UGX {cashoutReturn.toLocaleString()}</span>
          </p>
          <button
            onClick={handleCashout}
            disabled={exchangeCredits.isPending || cashoutValue < 1}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
          >
            {exchangeCredits.isPending ? 'Working…' : 'Move'}
          </button>
          {/* Kept: /sacco/savings is a real page and converting then saving is
              a real journey. Dropping the link would have removed a path, not
              just some noise. */}
          <Link href="/sacco/savings" className="block text-sm text-primary hover:underline">
            Save it on SACCO
          </Link>
        </div>
      </div>

      {/* Ways to earn, from the API — one line each, no icon per card. */}
      {opportunities.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold">Ways to earn</h2>
          <div className="divide-y overflow-hidden rounded-xl border bg-card">
            {opportunities.map((opportunity) => (
              <div key={opportunity.title} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{opportunity.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {opportunity.remaining_today} left today
                  </p>
                </div>
                <span className="shrink-0 font-semibold tabular-nums">
                  {opportunity.potential_credits}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {challenges.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold">Today</h2>
          <div className="divide-y overflow-hidden rounded-xl border bg-card">
            {challenges.map((challenge) => (
              <div key={challenge.title} className="p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate font-medium text-sm">{challenge.title}</p>
                  <span
                    className={cn(
                      'shrink-0 text-sm font-semibold tabular-nums',
                      challenge.completed ? 'text-muted-foreground' : undefined
                    )}
                  >
                    {challenge.completed ? 'Done' : challenge.reward}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                  {challenge.progress}/{challenge.target}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/*
        Top-up bonus. Kept as a compact band list rather than the four
        explanatory rows it was: the rate is the whole message, and it is the
        one fact on this page that changes how much someone tops up.
      */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-semibold text-sm">Top-up bonus</h2>
          <Link href="/wallet/topup" className="text-sm text-primary hover:underline">
            Top up
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          {TOPUP_BONUS_BANDS.map((band) => (
            <span key={band.from} className="text-muted-foreground tabular-nums">
              {band.from.toLocaleString()}+{' '}
              <span className="font-semibold text-foreground">{band.bonus}</span>
            </span>
          ))}
        </div>
      </div>

      {wallet?.next_milestone && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {formatNumber(wallet.next_milestone.credits_needed)}
          </span>{' '}
          more credits unlocks {wallet.next_milestone.reward}.
        </p>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent</h2>
          <button
            onClick={() => setShowHistory((current) => !current)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {showHistory ? 'Show less' : 'View all'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y overflow-hidden rounded-xl border bg-card">
            {transactions.map((transaction) => {
              const positive = POSITIVE_TYPES.has(transaction.type);

              return (
                <div key={transaction.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{transaction.description}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {transaction.relative_date || transaction.date}
                    </p>
                  </div>
                  {/* The API already signs the amount, e.g. "-1,000 credits".
                      Adding another sign here produced "-+1,000 credits". */}
                  <span
                    className={cn(
                      'shrink-0 font-semibold tabular-nums',
                      positive ? 'text-green-600 dark:text-green-400' : undefined
                    )}
                  >
                    {transaction.amount}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border bg-card py-12 text-center">
            <p className="text-muted-foreground">Nothing yet</p>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        <ArrowLeftRight className="mr-1.5 inline h-3.5 w-3.5" />
        Credits come from listening, tips and daily bonuses. Move them to your wallet to cash out.
      </p>
    </div>
  );
}
