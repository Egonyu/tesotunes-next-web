'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Coins,
  Wallet,
  Gift,
  History,
  ChevronLeft,
  Vote,
  Heart,
  Music,
  Loader2,
  Headphones,
  Share2,
  Calendar,
  Users,
  Trophy,
  Target,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet, apiPost } from '@/lib/api';
import { formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// Types (matching backend CreditController responses)
// ============================================================================

interface CreditWallet {
  available_credits: number;
  total_earned: number;
  total_spent: number;
  earned_today: number;
  spent_today: number;
  earning_potential_remaining: number;
  login_streak: number;
  next_milestone: { credits_needed: number; reward: string } | null;
  recent_transactions: CreditTransaction[];
}

interface EarningOpportunity {
  title: string;
  description: string;
  potential_credits: number;
  daily_limit: number;
  remaining_today: number;
  action: string;
  icon: string;
}

interface DailyChallenge {
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
}

interface CreditDashboard {
  wallet: CreditWallet;
  earning_opportunities: EarningOpportunity[];
  daily_challenges: DailyChallenge[];
}

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

// ============================================================================
// Component
// ============================================================================

export default function CreditsPage() {
  const queryClient = useQueryClient();
  const [showHistory, setShowHistory] = useState(false);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['credits', 'dashboard'],
    queryFn: () => apiGet<CreditDashboard>('/credits/dashboard'),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['credits', 'transactions'],
    queryFn: () => apiGet<{ data: CreditTransaction[] }>('/credits/transactions'),
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
  const transactions = transactionsData?.data || wallet?.recent_transactions || [];

  const useCases = [
    { icon: Vote, label: 'Vote in Awards', desc: 'Cast votes for your favorite artists' },
    { icon: Heart, label: 'Send Tips', desc: 'Support artists with credit tips' },
    { icon: Gift, label: 'Send Gifts', desc: 'Gift credits to friends' },
    { icon: Music, label: 'Unlock Content', desc: 'Access premium exclusive content' },
  ];

  const opportunityIcons: Record<string, React.ElementType> = {
    listening: Headphones,
    social: Share2,
    daily_login: Calendar,
    referral: Users,
    default: Coins,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-40 bg-muted rounded-xl" />
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Back */}
      <Link href="/wallet" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Back to Wallet
      </Link>

      {/* Credit Balance Card */}
      <div className="rounded-2xl bg-linear-to-br from-purple-500/20 via-indigo-500/10 to-blue-500/20 border border-purple-500/20 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium text-purple-500">CREDITS</span>
            </div>
            <h1 className="text-4xl font-bold">{formatNumber(wallet?.available_credits || 0)}</h1>
            <p className="text-muted-foreground mt-1">Available Credits</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-card/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Earned</p>
                  <p className="font-semibold">{formatNumber(wallet?.total_earned || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Spent</p>
                  <p className="font-semibold">{formatNumber(wallet?.total_spent || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Earned Today</p>
                  <p className="font-semibold text-green-500">{formatNumber(wallet?.earned_today || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Login Streak</p>
                  <p className="font-semibold">{wallet?.login_streak || 0} days</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => claimBonus.mutate()}
              disabled={claimBonus.isPending}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              {claimBonus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              Claim Daily Bonus
            </button>
          </div>
        </div>
      </div>

      {/* Earning Opportunities */}
      {opportunities.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Earn Credits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opp) => {
              const Icon = opportunityIcons[opp.icon] || opportunityIcons.default;
              return (
                <div key={opp.title} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{opp.title}</h4>
                      <p className="text-xs text-muted-foreground">{opp.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-500 font-medium">+{opp.potential_credits} credits</span>
                    <span className="text-muted-foreground">
                      {opp.remaining_today}/{opp.daily_limit} remaining
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Challenges */}
      {challenges.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Daily Challenges</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {challenges.map((ch) => (
              <div key={ch.title} className={cn(
                'rounded-xl border bg-card p-5',
                ch.completed && 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20'
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {ch.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Target className="h-5 w-5 text-purple-500" />
                    )}
                    <h4 className="font-semibold text-sm">{ch.title}</h4>
                  </div>
                  <span className="text-sm font-medium text-purple-500">+{ch.reward} credits</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{ch.description}</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      ch.completed ? 'bg-green-500' : 'bg-purple-500'
                    )}
                    style={{ width: `${Math.min((ch.progress / ch.target) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{ch.progress}/{ch.target}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Milestone */}
      {wallet?.next_milestone && (
        <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <div>
            <h3 className="font-semibold">Next Milestone</h3>
            <p className="text-sm text-muted-foreground">
              Earn {formatNumber(wallet.next_milestone.credits_needed)} more credits to unlock: {wallet.next_milestone.reward}
            </p>
          </div>
        </div>
      )}

      {/* What Credits Are For */}
      <div>
        <h2 className="text-xl font-bold mb-4">What Are Credits For?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((uc) => (
            <div key={uc.label} className="rounded-xl border bg-card p-5">
              <uc.icon className="h-6 w-6 text-purple-500 mb-3" />
              <h4 className="font-semibold text-sm">{uc.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">{uc.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-primary font-medium"
        >
          <History className="h-4 w-4" />
          {showHistory ? 'Hide' : 'Show'} Credit History
        </button>

        {showHistory && (
          <div className="mt-4 rounded-xl border bg-card divide-y">
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No credit transactions yet</div>
            ) : transactions.map((tx) => {
              const isPositive = ['earn', 'bonus', 'refund'].includes(tx.type);
              return (
                <div key={tx.id} className="p-4 flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                    isPositive ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                  )}>
                    {isPositive ? '+' : '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.source} &middot; {tx.relative_date || tx.date}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn('font-medium', isPositive ? 'text-green-500' : 'text-red-500')}>
                      {tx.amount}
                    </span>
                    <p className="text-xs text-muted-foreground">{tx.balance_after}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
