'use client';

import { useState } from 'react';
import { 
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistEarnings, useRequestWithdrawal } from '@/hooks/useArtist';

export default function ArtistEarningsPage() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'mtn_momo' | 'airtel_money' | 'bank_transfer'>('mtn_momo');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  
  const { data: earningsData, isLoading, error } = useArtistEarnings();
  const withdrawMutation = useRequestWithdrawal();
  
  const stats = earningsData?.stats || {
    balance: 0,
    pending_earnings: 0,
    total_earnings: 0,
    this_month: 0,
    monthly_change: 0
  };
  
  const earningsSources = earningsData?.earnings_sources || [];
  const transactions = earningsData?.transactions || [];
  
  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (amount >= 50000 && amount <= stats.balance) {
      withdrawMutation.mutate({
        amount,
        payment_method: withdrawMethod,
        phone_number: withdrawPhone || undefined,
      }, {
        onSuccess: () => {
          setShowWithdrawModal(false);
          setWithdrawAmount('');
        }
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">Failed to load earnings data</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">Track your revenue and withdrawals</p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          Withdraw Funds
        </button>
      </div>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl bg-linear-to-br from-primary to-purple-600 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5" />
            <span className="text-sm opacity-90">Available Balance</span>
          </div>
          <p className="text-3xl font-bold">UGX {stats.balance.toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">Ready for withdrawal</p>
        </div>
        
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span className="text-sm">Pending Earnings</span>
          </div>
          <p className="text-2xl font-bold">UGX {stats.pending_earnings.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">Being processed</p>
        </div>
        
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">This Month</span>
            </div>
            <span className={cn(
              'flex items-center gap-1 text-sm',
              stats.monthly_change >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {stats.monthly_change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(stats.monthly_change)}%
            </span>
          </div>
          <p className="text-2xl font-bold">UGX {stats.this_month.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">vs last month</p>
        </div>
      </div>
      
      {/* Earnings Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">Earnings by Source (This Month)</h2>
          <div className="space-y-4">
            {earningsSources.length === 0 ? (
              <p className="text-muted-foreground text-sm">No earnings data available</p>
            ) : earningsSources.map((item) => (
              <div key={item.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{item.source}</span>
                  <span className="text-sm font-medium">
                    UGX {item.amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between font-medium">
              <span>Total This Month</span>
              <span>UGX {stats.this_month.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Earnings Chart */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">Earnings Trend (6 Months)</h2>
          <div className="h-48 flex items-end justify-between gap-2">
            {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'].map((month, i) => {
              const height = 40 + Math.random() * 60;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={cn(
                      'w-full rounded-t transition-colors',
                      i === 5 ? 'bg-primary' : 'bg-primary/40 hover:bg-primary/60'
                    )}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Transaction History */}
      <div className="p-6 rounded-xl border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Transaction History</h2>
          <select className="text-sm px-3 py-1 border rounded-lg bg-background">
            <option>All transactions</option>
            <option>Earnings only</option>
            <option>Withdrawals only</option>
          </select>
        </div>
        
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div 
              key={tx.id} 
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'p-2 rounded-lg',
                  tx.type === 'earning' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                )}>
                  {tx.type === 'earning' ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  'font-semibold',
                  tx.amount >= 0 ? 'text-green-600' : ''
                )}>
                  {tx.amount >= 0 ? '+' : ''} UGX {Math.abs(tx.amount).toLocaleString()}
                </p>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  tx.status === 'completed' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : tx.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                )}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing 1-{transactions.length} of {transactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">UGX {stats.balance.toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Amount (UGX)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount (min 50,000)"
                  min="50000"
                  max={stats.balance}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Withdrawal Method</label>
                <select 
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as typeof withdrawMethod)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                >
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="airtel_money">Airtel Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              
              {(withdrawMethod === 'mtn_momo' || withdrawMethod === 'airtel_money') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    placeholder="0700 000 000"
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  />
                </div>
              )}
              
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-sm">
                <p className="text-yellow-700 dark:text-yellow-300">
                  Minimum withdrawal: UGX 50,000 • Processing: 1-3 business days
                </p>
              </div>
              
              {withdrawMutation.error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm">
                  <p className="text-red-700 dark:text-red-300">
                    Failed to process withdrawal. Please try again.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
                disabled={withdrawMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending || parseInt(withdrawAmount) < 50000 || parseInt(withdrawAmount) > stats.balance}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
