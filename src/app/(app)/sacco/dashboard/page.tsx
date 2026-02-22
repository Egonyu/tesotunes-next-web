'use client';

import Link from 'next/link';
import {
  TrendingUp,
  PiggyBank,
  CreditCard,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Calendar,
  AlertCircle,
  Target,
  Warehouse,
  Plus,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSaccoDashboard,
  useSaccoTransactions,
  useSaccoActiveLoan,
  type SaccoTransaction,
} from '@/hooks/useSacco';
import { useSaccoGoals } from '@/hooks/useSaccoGoals';
import {
  StatCard,
  GoalCard,
  StreakCounter,
  RecommendationCard,
  AchievementBadge,
  SaccoSkeleton
} from '@/components/sacco/shared';
import { useRouter } from 'next/navigation';

export default function SaccoDashboardPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading, error } = useSaccoDashboard();
  const { data: transactionsData } = useSaccoTransactions({ limit: 5 });
  const { data: activeLoanData } = useSaccoActiveLoan();
  const { data: goals } = useSaccoGoals({ status: 'active' });

  if (isLoading) {
    return <SaccoSkeleton />;
  }

  if (error || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load dashboard</h2>
        <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const memberData = dashboardData;
  const recentTransactions: SaccoTransaction[] = transactionsData?.data || [];
  const activeLoan = activeLoanData || null;
  const activeGoals = goals || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Member #{memberData.member_number} &bull; {memberData.status === 'active' ? '✅ Active' : memberData.status}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StreakCounter currentStreak={memberData.streak?.current_streak || 0} multiplier={memberData.streak?.multiplier || 1} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Savings"
          value={`${memberData.savings.balance.toLocaleString()} UGX`}
          subtitle={memberData.savings.total_credits ? `${memberData.savings.total_credits.toLocaleString()} credits` : undefined}
          icon={<PiggyBank className="h-5 w-5" />}
          color="emerald"
          trend={{ value: memberData.savings.change || 0, direction: memberData.savings.change >= 0 ? 'up' : 'down' }}
        />
        <StatCard
          title="Active Goals"
          value={memberData.goals?.active || activeGoals.length}
          subtitle={`${memberData.goals?.completed || 0} completed`}
          icon={<Target className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Loan Balance"
          value={memberData.loans.active > 0 ? `${memberData.loans.balance.toLocaleString()} UGX` : 'No Active Loans'}
          subtitle={memberData.loans.active > 0 ? `${memberData.loans.active} active` : 'Apply for funding'}
          icon={<CreditCard className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          title="Share Value"
          value={`${memberData.shares.value.toLocaleString()} UGX`}
          subtitle={`${memberData.shares.count} shares`}
          icon={<Coins className="h-5 w-5" />}
          color="purple"
          trend={{ value: memberData.shares.change || 0, direction: memberData.shares.change >= 0 ? 'up' : 'down' }}
        />
      </div>

      {/* Smart Recommendations */}
      {memberData.recommendations && memberData.recommendations.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Smart Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {memberData.recommendations.slice(0, 4).map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </section>
      )}

      {/* Active Savings Goals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Active Savings Goals</h3>
          <Link
            href="/sacco/savings/goals/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Goal
          </Link>
        </div>
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.slice(0, 4).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onClick={() => router.push(`/sacco/savings/goals/${goal.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h4 className="font-semibold mb-1">No active goals yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create a savings goal for your next music video, album, or concert!
            </p>
            <Link
              href="/sacco/savings/goals/create"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Create Your First Goal
            </Link>
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Link
              href="/sacco/savings"
              className="text-sm text-primary flex items-center"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No transactions yet. Make your first deposit!
              </div>
            ) : recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    tx.type === 'deposit' || tx.type === 'dividend'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  )}>
                    {tx.type === 'deposit' || tx.type === 'dividend' ? (
                      <ArrowDownRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.description || tx.type.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={cn(
                  'font-semibold text-sm',
                  tx.type === 'deposit' || tx.type === 'dividend' ? 'text-green-600' : 'text-red-600'
                )}>
                  {tx.type === 'deposit' || tx.type === 'dividend' ? '+' : '-'}
                  {tx.amount.toLocaleString()} UGX
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Loan */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Active Loan</h3>
            {activeLoan ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium">UGX {activeLoan.balance.toLocaleString()}</span>
                </div>
                <div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${((activeLoan.amount - activeLoan.balance) / activeLoan.amount) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(((activeLoan.amount - activeLoan.balance) / activeLoan.amount) * 100)}% repaid
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <span>Next: {activeLoan.next_payment.toLocaleString()} UGX on {new Date(activeLoan.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link href={`/sacco/loans/${activeLoan.id}`} className="block w-full text-center py-2 border rounded-lg hover:bg-muted text-sm font-medium">
                  View Details
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No active loans</p>
                <Link href="/sacco/loans/apply" className="text-sm font-medium text-emerald-600 hover:underline">
                  Apply for a Loan →
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/sacco/savings?action=deposit" className="p-4 rounded-lg border hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 text-center transition-colors">
                <PiggyBank className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
                <p className="text-xs font-medium">Deposit</p>
              </Link>
              <Link href="/sacco/savings/goals/create" className="p-4 rounded-lg border hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 text-center transition-colors">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-medium">New Goal</p>
              </Link>
              <Link href="/sacco/resources" className="p-4 rounded-lg border hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 text-center transition-colors">
                <Warehouse className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-xs font-medium">Resources</p>
              </Link>
              <Link href="/sacco/loans/apply" className="p-4 rounded-lg border hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:border-amber-200 text-center transition-colors">
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                <p className="text-xs font-medium">Get Loan</p>
              </Link>
            </div>
          </div>

          {/* Recent Achievements */}
          {memberData.achievements && memberData.achievements.recent && memberData.achievements.recent.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Achievements</h3>
                <Link href="/sacco/community/achievements" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {memberData.achievements.recent.map((ach) => (
                  <AchievementBadge key={ach.code} achievement={ach} size="sm" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
