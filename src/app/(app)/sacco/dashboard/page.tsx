'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BanknoteArrowDown,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  CreditCard,
  PiggyBank,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import {
  type SaccoTransaction,
  useSaccoActiveLoan,
  useSaccoDashboard,
  useSaccoMembership,
  useSaccoShares,
  useSaccoTransactions,
} from '@/hooks/useSacco';
import { useSaccoGoals } from '@/hooks/useSaccoGoals';
import { SaccoSkeleton } from '@/components/sacco/shared';

type Tone = 'emerald' | 'blue' | 'amber' | 'violet';

const toneStyles: Record<Tone, string> = {
  emerald: 'from-emerald-500/18 via-emerald-500/6 to-white border-emerald-200/70',
  blue: 'from-sky-500/18 via-sky-500/6 to-white border-sky-200/70',
  amber: 'from-amber-500/18 via-amber-500/6 to-white border-amber-200/70',
  violet: 'from-fuchsia-500/18 via-fuchsia-500/6 to-white border-fuchsia-200/70',
};

const iconToneStyles: Record<Tone, string> = {
  emerald: 'bg-emerald-600 text-white shadow-emerald-200/80',
  blue: 'bg-sky-600 text-white shadow-sky-200/80',
  amber: 'bg-amber-500 text-white shadow-amber-200/80',
  violet: 'bg-fuchsia-600 text-white shadow-fuchsia-200/80',
};

function DashboardMetricCard({
  title,
  value,
  subtitle,
  tone,
  icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone: Tone;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[28px] border bg-gradient-to-br p-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)]',
        toneStyles[tone]
      )}
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/60 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {title}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="text-sm text-slate-600">{subtitle}</p>
          {trend ? <p className="text-xs font-medium text-slate-500">{trend}</p> : null}
        </div>
        <div className={cn('rounded-2xl p-3 shadow-lg', iconToneStyles[tone])}>{icon}</div>
      </div>
    </div>
  );
}

function SectionShell({
  title,
  kicker,
  action,
  children,
  className,
}: {
  title: string;
  kicker?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-[30px] border border-slate-200 bg-white/90 p-5 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur',
        className
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {kicker ? (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {kicker}
            </p>
          ) : null}
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProgressStrip({
  label,
  value,
  max,
  tone,
  helper,
}: {
  label: string;
  value: number;
  max: number;
  tone: Tone;
  helper?: string;
}) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barTone = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-sky-500 to-cyan-500',
    amber: 'from-amber-400 to-orange-500',
    violet: 'from-fuchsia-500 to-violet-500',
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{helper ?? `${Math.round(percentage)}%`}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', barTone)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TransactionRow({ tx }: { tx: SaccoTransaction }) {
  const positive = tx.type === 'deposit' || tx.type === 'dividend' || tx.type === 'goal_deposit';
  const Icon = positive ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">
            {tx.description || tx.type.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-slate-500">{formatDate(tx.date)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn('text-sm font-semibold', positive ? 'text-emerald-600' : 'text-rose-600')}>
          {positive ? '+' : '-'}
          {formatCurrency(tx.amount)}
        </p>
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{tx.status}</p>
      </div>
    </div>
  );
}

export default function SaccoDashboardPage() {
  const { data: dashboardData, isLoading, error } = useSaccoDashboard();
  const { data: membership } = useSaccoMembership();
  const { data: transactionsData } = useSaccoTransactions({ limit: 6 });
  const { data: activeLoan } = useSaccoActiveLoan();
  const { data: goals } = useSaccoGoals({ status: 'active' });
  const { data: shares } = useSaccoShares();

  if (isLoading) {
    return <SaccoSkeleton />;
  }

  if (error || !dashboardData) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-300 bg-white text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-slate-400" />
        <h2 className="mb-2 text-xl font-semibold text-slate-950">Unable to load SACCO dashboard</h2>
        <p className="mb-4 max-w-md text-sm text-slate-500">
          We could not fetch your latest SACCO analytics. Please retry once the connection is stable.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const transactions = transactionsData?.data ?? [];
  const activeGoals = goals ?? [];
  const savingsBalance = membership?.savings_balance ?? dashboardData.savings.balance ?? 0;
  const shareValue = shares?.total_value ?? membership?.shares_value ?? dashboardData.shares.value ?? 0;
  const shareCount = shares?.total_shares ?? membership?.shares_count ?? dashboardData.shares.count ?? 0;
  const totalPortfolio = savingsBalance + shareValue;
  const savingsShare = totalPortfolio > 0 ? (savingsBalance / totalPortfolio) * 100 : 0;
  const sharesShare = totalPortfolio > 0 ? (shareValue / totalPortfolio) * 100 : 0;
  const monthlySavings = dashboardData.savings.this_month ?? 0;
  const monthlyDeposits = transactions
    .filter((tx) => tx.type === 'deposit' || tx.type === 'goal_deposit')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthlyOutflow = transactions
    .filter((tx) => tx.type === 'withdrawal' || tx.type === 'loan_payment' || tx.type === 'share_purchase')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const completedGoalCount = dashboardData.goals?.completed ?? 0;
  const activeGoalTarget = activeGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const activeGoalSaved = activeGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const goalCompletionRate = activeGoalTarget > 0 ? (activeGoalSaved / activeGoalTarget) * 100 : 0;
  const loanRepaymentRate =
    activeLoan && activeLoan.amount > 0
      ? ((activeLoan.amount - activeLoan.balance) / activeLoan.amount) * 100
      : 0;
  const membershipAge = membership?.joined_at ? formatDate(membership.joined_at, { month: 'short', year: 'numeric' }) : 'Recently';
  const trendText =
    monthlySavings > 0 ? `${formatCurrency(monthlySavings)} saved this month` : 'No savings posted this month yet';

  return (
    <div className="space-y-6 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_24%)] pb-2">
      <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(135deg,#052e2b_0%,#0f766e_48%,#effcf7_160%)] p-6 text-white shadow-[0_28px_70px_-40px_rgba(5,46,43,0.85)]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50">
              <Sparkles className="h-3.5 w-3.5" />
              SACCO analytics benchmark rebuild
            </div>
            <div>
              <p className="text-sm text-emerald-100">
                Member #{dashboardData.member_number || 'Pending'} • {dashboardData.status}
              </p>
              <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                A finance control room for savings, shares, goals, and loan readiness.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90">
                This dashboard now mirrors the benchmark’s analytics feel while staying wired to the live SACCO contracts already available in TesoTunes.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Portfolio</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalPortfolio)}</p>
                <p className="text-sm text-emerald-50/80">Savings + share capital</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Monthly flow</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(monthlySavings)}</p>
                <p className="text-sm text-emerald-50/80">Tracked from dashboard contract</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Member since</p>
                <p className="mt-2 text-2xl font-semibold">{membershipAge}</p>
                <p className="text-sm text-emerald-50/80">Status: {dashboardData.status}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Action center</p>
                  <h2 className="mt-1 text-xl font-semibold">Move money fast</h2>
                </div>
                <Wallet className="h-5 w-5 text-emerald-100" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link href="/sacco/savings?action=deposit" className="rounded-2xl bg-white px-4 py-3 font-medium text-slate-900 transition-transform hover:-translate-y-0.5">
                  Deposit savings
                </Link>
                <Link href="/sacco/shares" className="rounded-2xl border border-white/25 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10">
                  Buy shares
                </Link>
                <Link href="/sacco/loans/apply" className="rounded-2xl border border-white/25 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10">
                  Apply loan
                </Link>
                <Link href="/sacco/savings/goals/create" className="rounded-2xl border border-white/25 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10">
                  Create goal
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Live pulse</p>
                  <p className="mt-1 text-xl font-semibold">{transactions.length} recent records</p>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-100" />
              </div>
              <div className="mt-4 space-y-3 text-sm text-emerald-50/90">
                <div className="flex items-center justify-between">
                  <span>Deposits captured</span>
                  <span className="font-medium">{formatCurrency(monthlyDeposits)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Outflow captured</span>
                  <span className="font-medium">{formatCurrency(monthlyOutflow)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed goals</span>
                  <span className="font-medium">{completedGoalCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-4">
        <DashboardMetricCard
          title="Savings balance"
          value={formatCurrency(savingsBalance)}
          subtitle={trendText}
          tone="emerald"
          icon={<PiggyBank className="h-5 w-5" />}
          trend={dashboardData.savings.total_credits ? `${dashboardData.savings.total_credits.toLocaleString()} credits tracked` : undefined}
        />
        <DashboardMetricCard
          title="Share capital"
          value={formatCurrency(shareValue)}
          subtitle={`${shareCount.toLocaleString()} shares held`}
          tone="violet"
          icon={<Coins className="h-5 w-5" />}
          trend={shareCount > 0 ? 'Live from shares contract' : 'No shares purchased yet'}
        />
        <DashboardMetricCard
          title="Active goals"
          value={activeGoals.length.toString()}
          subtitle={activeGoals.length > 0 ? `${formatCurrency(activeGoalSaved)} already allocated` : 'No active goal pipeline'}
          tone="blue"
          icon={<Target className="h-5 w-5" />}
          trend={`${completedGoalCount} completed goals`}
        />
        <DashboardMetricCard
          title="Loan position"
          value={activeLoan ? formatCurrency(activeLoan.balance) : 'No active loan'}
          subtitle={activeLoan ? `${Math.round(loanRepaymentRate)}% repaid` : 'You can apply when ready'}
          tone="amber"
          icon={<CreditCard className="h-5 w-5" />}
          trend={activeLoan ? `${formatCurrency(activeLoan.next_payment)} next installment` : undefined}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionShell
          title="Portfolio allocation"
          kicker="Benchmark block"
          action={
            <Link href="/sacco/shares" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800">
              Manage capital <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
            <div className="flex min-h-[240px] flex-col justify-between rounded-[28px] bg-slate-950 p-5 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Capital mix</p>
                <h4 className="mt-2 text-2xl font-semibold">{formatCurrency(totalPortfolio)}</h4>
                <p className="mt-2 max-w-sm text-sm text-slate-300">
                  Your SACCO capital stack blends liquid savings and share value. Both are now sourced from their proper backend totals.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Savings</p>
                  <p className="mt-2 text-xl font-semibold">{Math.round(savingsShare)}%</p>
                  <p className="text-xs text-slate-400">{formatCurrency(savingsBalance)}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Shares</p>
                  <p className="mt-2 text-xl font-semibold">{Math.round(sharesShare)}%</p>
                  <p className="text-xs text-slate-400">{formatCurrency(shareValue)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <ProgressStrip
                label="Savings strength"
                value={savingsBalance}
                max={Math.max(totalPortfolio, 1)}
                tone="emerald"
                helper={`${Math.round(savingsShare)}% of portfolio`}
              />
              <ProgressStrip
                label="Share capital strength"
                value={shareValue}
                max={Math.max(totalPortfolio, 1)}
                tone="violet"
                helper={`${Math.round(sharesShare)}% of portfolio`}
              />
              <ProgressStrip
                label="Goal funding progress"
                value={activeGoalSaved}
                max={Math.max(activeGoalTarget, 1)}
                tone="blue"
                helper={activeGoals.length > 0 ? `${Math.round(goalCompletionRate)}% funded` : 'No active goals'}
              />
              <ProgressStrip
                label="Loan repayment"
                value={loanRepaymentRate}
                max={100}
                tone="amber"
                helper={activeLoan ? `${Math.round(loanRepaymentRate)}% repaid` : 'No active loan'}
              />
            </div>
          </div>
        </SectionShell>

        <SectionShell title="Loan snapshot" kicker="Credit desk">
          {activeLoan ? (
            <div className="space-y-4">
              <div className="rounded-[24px] bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Outstanding balance</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {formatCurrency(activeLoan.balance)}
                </p>
                <p className="mt-1 text-sm text-slate-600">{activeLoan.product}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Monthly payment</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(activeLoan.monthly_payment)}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Interest rate</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{activeLoan.interest_rate}%</p>
                </div>
              </div>
              <ProgressStrip
                label="Repayment progress"
                value={loanRepaymentRate}
                max={100}
                tone="amber"
                helper={`${Math.round(loanRepaymentRate)}% completed`}
              />
              <div className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-2 text-slate-900">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  Next installment
                </div>
                <p className="mt-2 font-medium">
                  {formatCurrency(activeLoan.next_payment)} due on {formatDate(activeLoan.due_date)}
                </p>
              </div>
              <Link
                href={`/sacco/loans/${activeLoan.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
              >
                View loan details
              </Link>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-between gap-5">
              <div className="rounded-[24px] bg-slate-950 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Loan readiness</p>
                <h4 className="mt-2 text-2xl font-semibold">No active loan right now</h4>
                <p className="mt-2 text-sm text-slate-300">
                  Your dashboard is free of loan obligations. Savings and shares are already reflected correctly for the next application.
                </p>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                  <span>Savings considered</span>
                  <span className="font-medium text-slate-900">{formatCurrency(savingsBalance)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                  <span>Shares considered</span>
                  <span className="font-medium text-slate-900">{formatCurrency(shareValue)}</span>
                </div>
              </div>
              <Link
                href="/sacco/loans/apply"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
              >
                Apply for a loan
              </Link>
            </div>
          )}
        </SectionShell>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <SectionShell
          title="Goal pipeline"
          kicker="Funding goals"
          className="lg:col-span-7"
          action={
            <Link href="/sacco/savings/goals/create" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800">
              New goal <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          {activeGoals.length > 0 ? (
            <div className="space-y-4">
              {activeGoals.slice(0, 4).map((goal) => (
                <div key={goal.id} className="rounded-[24px] border border-slate-100 p-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                        {goal.type.replace(/_/g, ' ')}
                      </div>
                      <h4 className="text-base font-semibold text-slate-950">{goal.title}</h4>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-slate-950">{Math.round(goal.progress.percentage)}%</p>
                      <p className="text-slate-500">{formatCurrency(goal.current_amount)} saved</p>
                    </div>
                  </div>
                  <ProgressStrip
                    label="Goal progress"
                    value={goal.current_amount}
                    max={Math.max(goal.target_amount, 1)}
                    tone={goal.progress.on_track ? 'emerald' : 'amber'}
                    helper={`Target ${formatCurrency(goal.target_amount)}`}
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CircleDollarSign className="h-3.5 w-3.5" />
                      {goal.currency.toUpperCase()}
                    </span>
                    {goal.deadline ? (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(goal.deadline)}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      {goal.progress.on_track ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                      {goal.progress.on_track ? 'On track' : 'Needs attention'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <Target className="mx-auto h-10 w-10 text-slate-400" />
              <h4 className="mt-3 text-lg font-semibold text-slate-950">No active savings goals</h4>
              <p className="mt-1 text-sm text-slate-500">
                Build out your next music video, album, or equipment budget with a goal linked to the live SACCO workflow.
              </p>
            </div>
          )}
        </SectionShell>

        <SectionShell title="Funding signals" kicker="Operational pulse" className="lg:col-span-5">
          <div className="space-y-4">
            <div className="rounded-[24px] bg-sky-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">This month</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(monthlySavings)}</p>
              <p className="mt-1 text-sm text-slate-600">Savings movement reported by the SACCO dashboard endpoint.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 p-4">
                <BanknoteArrowDown className="h-5 w-5 text-emerald-600" />
                <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Deposits seen</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(monthlyDeposits)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <ArrowUpRight className="h-5 w-5 text-rose-600" />
                <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Outflows seen</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(monthlyOutflow)}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Goal completion ratio</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{Math.round(goalCompletionRate)}%</p>
              <p className="mt-1 text-sm text-slate-500">
                {activeGoals.length > 0
                  ? `${formatCurrency(activeGoalSaved)} of ${formatCurrency(activeGoalTarget)} currently funded`
                  : 'Create a goal to start tracking funding progress.'}
              </p>
            </div>
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionShell
          title="Recent transactions"
          kicker="Activity feed"
          action={
            <Link href="/sacco/savings" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800">
              View savings <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              No transactions yet. Your first deposit or share purchase will appear here.
            </div>
          )}
        </SectionShell>

        <SectionShell title="Next best actions" kicker="Workflow shortcuts">
          <div className="grid gap-3 md:grid-cols-2">
            <Link href="/sacco/savings?action=deposit" className="group rounded-[24px] border border-slate-200 bg-emerald-50 p-4 transition-transform hover:-translate-y-0.5">
              <PiggyBank className="h-5 w-5 text-emerald-700" />
              <h4 className="mt-3 text-base font-semibold text-slate-950">Top up savings</h4>
              <p className="mt-1 text-sm text-slate-600">Add fresh capital to improve savings coverage and loan readiness.</p>
            </Link>
            <Link href="/sacco/shares" className="group rounded-[24px] border border-slate-200 bg-fuchsia-50 p-4 transition-transform hover:-translate-y-0.5">
              <Coins className="h-5 w-5 text-fuchsia-700" />
              <h4 className="mt-3 text-base font-semibold text-slate-950">Increase shares</h4>
              <p className="mt-1 text-sm text-slate-600">Grow your share capital and strengthen the capital mix on the dashboard.</p>
            </Link>
            <Link href="/sacco/loans/apply" className="group rounded-[24px] border border-slate-200 bg-amber-50 p-4 transition-transform hover:-translate-y-0.5">
              <CreditCard className="h-5 w-5 text-amber-700" />
              <h4 className="mt-3 text-base font-semibold text-slate-950">Request financing</h4>
              <p className="mt-1 text-sm text-slate-600">Use the updated loan flow that now works even when backend loan products are not seeded.</p>
            </Link>
            <Link href="/sacco/savings/goals/create" className="group rounded-[24px] border border-slate-200 bg-sky-50 p-4 transition-transform hover:-translate-y-0.5">
              <Target className="h-5 w-5 text-sky-700" />
              <h4 className="mt-3 text-base font-semibold text-slate-950">Open a goal</h4>
              <p className="mt-1 text-sm text-slate-600">Track a production budget with the same live savings-goal contract used elsewhere in SACCO.</p>
            </Link>
          </div>
        </SectionShell>
      </div>
    </div>
  );
}
