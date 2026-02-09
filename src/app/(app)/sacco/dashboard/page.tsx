'use client';

import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown,
  PiggyBank, 
  CreditCard, 
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useSaccoDashboard, 
  useSaccoTransactions, 
  useSaccoActiveLoan,
  SaccoMemberDashboard,
  SaccoTransaction,
  SaccoLoan
} from '@/hooks/useSacco';

export default function SaccoDashboardPage() {
  // Use the new SACCO hooks
  const { data: dashboardData, isLoading, error } = useSaccoDashboard();
  const { data: transactionsData, isLoading: loadingTransactions } = useSaccoTransactions({ limit: 5 });
  const { data: activeLoanData, isLoading: loadingLoan } = useSaccoActiveLoan();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
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
  const loanPaidPercent = memberData.loans.total_borrowed > 0
    ? Math.round((memberData.loans.total_paid / memberData.loans.total_borrowed) * 100)
    : 0;
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Member: {memberData.member_number}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/sacco/savings?action=deposit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
          >
            Make Deposit
          </Link>
          <Link
            href="/sacco/loans/apply"
            className="px-4 py-2 border rounded-lg font-medium hover:bg-muted"
          >
            Apply for Loan
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Savings */}
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className={cn(
              'flex items-center gap-1 text-sm',
              memberData.savings.change >= 0 ? 'text-green-500' : 'text-red-500'
            )}>
              {memberData.savings.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {memberData.savings.change}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Total Savings</p>
          <p className="text-2xl font-bold">UGX {memberData.savings.balance.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            +{memberData.savings.this_month.toLocaleString()} this month
          </p>
        </div>
        
        {/* Shares */}
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Coins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              {memberData.shares.change}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Share Value</p>
          <p className="text-2xl font-bold">UGX {memberData.shares.value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {memberData.shares.count} shares @ 10,000 each
          </p>
        </div>
        
        {/* Loan Balance */}
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
              {memberData.loans.active} active
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Loan Balance</p>
          <p className="text-2xl font-bold">UGX {memberData.loans.balance.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {loanPaidPercent}% paid off
          </p>
        </div>
        
        {/* Dividends */}
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Last Year Dividends</p>
          <p className="text-2xl font-bold">UGX {memberData.dividends.last_year.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on savings & shares
          </p>
        </div>
      </div>
      
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
                    <p className="font-medium">{tx.description || tx.type.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={cn(
                  'font-semibold',
                  tx.type === 'deposit' || tx.type === 'dividend'
                    ? 'text-green-600'
                    : 'text-red-600'
                )}>
                  {tx.type === 'deposit' || tx.type === 'dividend' ? '+' : '-'}
                  UGX {tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Loan */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Active Loan</h3>
            
            {activeLoan ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Amount</span>
                  <span className="font-medium">UGX {activeLoan.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding Balance</span>
                  <span className="font-medium">UGX {activeLoan.balance.toLocaleString()}</span>
                </div>
                
                {/* Progress Bar */}
                <div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500"
                      style={{ width: `${((activeLoan.amount - activeLoan.balance) / activeLoan.amount) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(((activeLoan.amount - activeLoan.balance) / activeLoan.amount) * 100)}% repaid
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Next Payment Due</p>
                      <p className="text-sm text-muted-foreground">
                        UGX {activeLoan.next_payment.toLocaleString()} on {new Date(activeLoan.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Link
                  href={`/sacco/loans/${activeLoan.id}`}
                  className="block w-full text-center py-2 border rounded-lg hover:bg-muted"
                >
                  View Loan Details
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No active loans</p>
                <Link
                  href="/sacco/loans/apply"
                  className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Apply for a Loan
                </Link>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/sacco/savings?action=deposit"
                className="p-4 rounded-lg border hover:bg-muted text-center"
              >
                <PiggyBank className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
                <p className="text-sm font-medium">Deposit</p>
              </Link>
              <Link
                href="/sacco/savings?action=withdraw"
                className="p-4 rounded-lg border hover:bg-muted text-center"
              >
                <ArrowUpRight className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-medium">Withdraw</p>
              </Link>
              <Link
                href="/sacco/shares?action=buy"
                className="p-4 rounded-lg border hover:bg-muted text-center"
              >
                <Coins className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Buy Shares</p>
              </Link>
              <Link
                href="/sacco/loans/apply"
                className="p-4 rounded-lg border hover:bg-muted text-center"
              >
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Get Loan</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
