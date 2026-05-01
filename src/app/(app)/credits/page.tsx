'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Calendar,
  CheckCircle,
  Coins,
  Gift,
  Headphones,
  History,
  Loader2,
  Music,
  PiggyBank,
  Share2,
  Target,
  Trophy,
  Wallet,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { cn, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { useCreditBalance, useExchangeCredits, usePurchaseCredits } from '@/hooks/usePayments';

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

const positiveTransactionTypes = new Set(['earn', 'bonus', 'refund', 'transfer_in', 'daily_login_bonus', 'wallet_purchase']);

function getOpportunityIcon(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes('listen')) return Headphones;
  if (normalized.includes('social')) return Share2;
  if (normalized.includes('invite')) return Gift;
  if (normalized.includes('playlist')) return Music;

  return Coins;
}

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
      toast.success('Daily bonus claimed!');
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
    onError: () => toast.error('Already claimed today or not eligible.'),
  });

  const wallet = dashboard?.wallet;
  const opportunities = dashboard?.earning_opportunities || [];
  const challenges = dashboard?.daily_challenges || [];
  const transactions = showHistory ? transactionsData || [] : wallet?.recent_transactions || [];
  const ugxPerCredit = balance?.exchange_rate?.ugx_per_credit ?? 1;
  const creditsPerUgx = balance?.exchange_rate?.credits_per_ugx ?? 1;
  const buyCreditsValue = parseInt(buyCredits.replace(/\D/g, ''), 10) || 0;
  const cashoutCreditsValue = parseInt(cashoutCredits.replace(/\D/g, ''), 10) || 0;
  const buyWalletCost = buyCreditsValue > 0 ? Math.max(1, Math.round(buyCreditsValue * ugxPerCredit)) : 0;
  const cashoutWalletReturn = cashoutCreditsValue > 0 ? Math.max(1, Math.round(cashoutCreditsValue * ugxPerCredit)) : 0;

  const useCases = useMemo(
    () => [
      { icon: Music, label: 'Buy songs', desc: 'Unlock paid tracks and premium drops.' },
      { icon: Gift, label: 'Tip artists', desc: 'Support creators directly with credits.' },
      { icon: Wallet, label: 'Move to wallet', desc: 'Convert credits back into UGX wallet balance.' },
      { icon: PiggyBank, label: 'Save on SACCO', desc: 'Route wallet funds into SACCO savings and goals.' },
    ],
    []
  );

  const handleBuyCredits = async () => {
    if (buyCreditsValue < 1) {
      toast.error('Enter the number of credits to buy.');
      return;
    }

    await purchaseCredits.mutateAsync(
      { credits_amount: buyCreditsValue },
      {
        onSuccess: () => {
          toast.success('Credits purchased successfully.');
          setBuyCredits('');
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Could not buy credits.');
        },
      }
    );
  };

  const handleCashoutCredits = async () => {
    if (cashoutCreditsValue < 1) {
      toast.error('Enter the number of credits to convert.');
      return;
    }

    await exchangeCredits.mutateAsync(
      { direction: 'credits_to_wallet', credits_amount: cashoutCreditsValue },
      {
        onSuccess: () => {
          toast.success('Credits converted to wallet balance.');
          setCashoutCredits('');
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Could not convert credits.');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-40 bg-muted rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-56 bg-muted rounded-lg" />
          <div className="h-56 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Link href="/wallet" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeftRight className="h-4 w-4" />
        Back to Wallet
      </Link>

      <div className="rounded-2xl bg-linear-to-br from-amber-400/20 via-orange-400/10 to-emerald-400/20 border border-amber-300/30 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-6 w-6 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">CREDITS WALLET</span>
            </div>
            <h1 className="text-4xl font-bold">{formatNumber(wallet?.available_credits || 0)}</h1>
            <p className="text-muted-foreground mt-1">Available credits</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 min-w-0 lg:min-w-[380px]">
            <div className="rounded-xl bg-card/70 p-4">
              <p className="text-sm text-muted-foreground">UGX wallet balance</p>
              <p className="mt-1 text-xl font-semibold">UGX {(balance?.wallet_balance || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-card/70 p-4">
              <p className="text-sm text-muted-foreground">Exchange rate</p>
              <p className="mt-1 text-xl font-semibold">{creditsPerUgx.toLocaleString()} credits / UGX</p>
            </div>
            <div className="rounded-xl bg-card/70 p-4">
              <p className="text-sm text-muted-foreground">Earned today</p>
              <p className="mt-1 text-xl font-semibold text-green-600">{formatNumber(wallet?.earned_today || 0)}</p>
            </div>
            <div className="rounded-xl bg-card/70 p-4">
              <p className="text-sm text-muted-foreground">Login streak</p>
              <p className="mt-1 text-xl font-semibold">{wallet?.login_streak || 0} days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold">Buy Credits</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert your UGX wallet balance into credits instantly. Top up the wallet first if needed.
          </p>
          <input
            type="text"
            value={buyCredits}
            onChange={(event) => setBuyCredits(event.target.value.replace(/[^\d]/g, ''))}
            placeholder="Credits to buy"
            className="w-full rounded-lg border bg-background px-4 py-3"
          />
          <div className="rounded-lg bg-muted/40 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet charge</span>
              <span className="font-medium">UGX {buyWalletCost.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={handleBuyCredits}
            disabled={purchaseCredits.isPending || buyCreditsValue < 1}
            className={cn(
              'w-full rounded-lg py-3 font-medium transition-colors',
              purchaseCredits.isPending || buyCreditsValue < 1
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {purchaseCredits.isPending ? 'Processing...' : 'Buy Credits'}
          </button>
          <Link href="/wallet/topup" className="block text-sm text-primary hover:underline">
            Need more wallet balance? Top up with ZengaPay.
          </Link>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">Convert Credits to Wallet</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Move credits back into your UGX wallet, then use the wallet for withdrawals, SACCO savings, shares, and goals.
          </p>
          <input
            type="text"
            value={cashoutCredits}
            onChange={(event) => setCashoutCredits(event.target.value.replace(/[^\d]/g, ''))}
            placeholder="Credits to convert"
            className="w-full rounded-lg border bg-background px-4 py-3"
          />
          <div className="rounded-lg bg-muted/40 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet receives</span>
              <span className="font-medium">UGX {cashoutWalletReturn.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={handleCashoutCredits}
            disabled={exchangeCredits.isPending || cashoutCreditsValue < 1}
            className={cn(
              'w-full rounded-lg py-3 font-medium transition-colors',
              exchangeCredits.isPending || cashoutCreditsValue < 1
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {exchangeCredits.isPending ? 'Processing...' : 'Convert to Wallet'}
          </button>
          <Link href="/sacco/savings" className="block text-sm text-primary hover:underline">
            Save the wallet balance into SACCO.
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => claimBonus.mutate()}
          disabled={claimBonus.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {claimBonus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
          Claim Daily Bonus
        </button>
        <Link href="/wallet/topup" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 hover:bg-muted">
          <Wallet className="h-4 w-4" />
          Top Up Wallet
        </Link>
        <Link href="/sacco/savings" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 hover:bg-muted">
          <PiggyBank className="h-4 w-4" />
          Save on SACCO
        </Link>
      </div>

      {opportunities.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Earn Credits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {opportunities.map((opp) => {
              const Icon = getOpportunityIcon(opp.title);
              return (
                <div key={opp.title} className="rounded-xl border bg-card p-5">
                  <Icon className="h-5 w-5 text-primary mb-3" />
                  <h4 className="font-semibold text-sm">{opp.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">{opp.description}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Reward: {opp.potential_credits}</p>
                    <p>Daily limit: {opp.daily_limit}</p>
                    <p>Remaining today: {opp.remaining_today}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {challenges.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Daily Challenges</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.title}
                className={cn(
                  'rounded-xl border bg-card p-5',
                  challenge.completed && 'border-green-500/30 bg-green-50/50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {challenge.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Target className="h-5 w-5 text-primary" />
                    )}
                    <h4 className="font-semibold text-sm">{challenge.title}</h4>
                  </div>
                  <span className="text-sm font-medium text-primary">{challenge.reward}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', challenge.completed ? 'bg-green-500' : 'bg-primary')}
                    style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{challenge.progress}/{challenge.target}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {wallet?.next_milestone && (
        <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <div>
            <h3 className="font-semibold">Next Milestone</h3>
            <p className="text-sm text-muted-foreground">
              Earn {formatNumber(wallet.next_milestone.credits_needed)} more credits to unlock {wallet.next_milestone.reward}.
            </p>
          </div>
        </div>
      )}

      {/* Top-Up Bonus Tiers */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold text-lg">Top-Up Bonus Credits</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Top up your wallet and we automatically award bonus credits — the bigger the top-up, the bigger the bonus.
          </p>
        </div>
        <div className="divide-y">
          {[
            { range: '5,000 – 9,999 UGX', bonus: '+10%', example: 'e.g. 500 free credits on a 5,000 UGX top-up' },
            { range: '10,000 – 19,999 UGX', bonus: '+20%', example: 'e.g. 2,000 free credits on a 10,000 UGX top-up' },
            { range: '20,000 – 49,999 UGX', bonus: '+30%', example: 'e.g. 6,000 free credits on a 20,000 UGX top-up' },
            { range: '50,000+ UGX', bonus: '+40%', example: 'e.g. 20,000 free credits on a 50,000 UGX top-up' },
          ].map((tier) => (
            <div key={tier.range} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-sm">{tier.range}</p>
                <p className="text-xs text-muted-foreground">{tier.example}</p>
              </div>
              <span className="text-green-600 font-bold text-lg">{tier.bonus}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 bg-muted/30 text-xs text-muted-foreground">
          Bonus credits are awarded instantly when your top-up is confirmed.{' '}
          <Link href="/wallet/topup" className="text-primary hover:underline">Top up now →</Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">What Credits Are For</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((useCase) => (
            <div key={useCase.label} className="rounded-xl border bg-card p-5">
              <useCase.icon className="h-6 w-6 text-primary mb-3" />
              <h4 className="font-semibold text-sm">{useCase.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowHistory((current) => !current)}
          className="flex items-center gap-2 text-primary font-medium"
        >
          <History className="h-4 w-4" />
          {showHistory ? 'Hide' : 'Show'} Credit History
        </button>

        {showHistory && (
          <div className="mt-4 rounded-xl border bg-card divide-y">
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No credit transactions yet</div>
            ) : (
              transactions.map((tx) => {
                const isPositive = positiveTransactionTypes.has(tx.type);

                return (
                  <div key={tx.id} className="p-4 flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                        isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      )}
                    >
                      {isPositive ? '+' : '-'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.source} • {tx.relative_date || tx.date}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn('font-medium', isPositive ? 'text-green-500' : 'text-red-500')}>
                        {tx.amount}
                      </span>
                      <p className="text-xs text-muted-foreground">{tx.balance_after}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
