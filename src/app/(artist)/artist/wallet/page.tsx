'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  Phone,
  Building2,
  Shield,
  History,
  Plus,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistEarnings, useRequestWithdrawal, useArtistProfile } from '@/hooks/useArtist';
import { toast } from 'sonner';

type PaymentMethod = 'zengapay';

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'zengapay', label: 'ZengaPay Mobile Money', icon: Smartphone, description: 'Withdraw via MTN MoMo or Airtel Money through ZengaPay' },
];

export default function ArtistWalletPage() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>('zengapay');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'methods'>('overview');

  const { data: earningsData, isLoading, error } = useArtistEarnings();
  const { data: profile } = useArtistProfile();
  const withdrawMutation = useRequestWithdrawal();

  const stats = earningsData?.stats || {
    balance: 0,
    pending_earnings: 0,
    total_earnings: 0,
    this_month: 0,
    monthly_change: 0,
  };

  const transactions = earningsData?.transactions || [];
  const earningsSources = earningsData?.earnings_sources || [];

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (amount < 50000) {
      toast.error('Minimum withdrawal amount is UGX 50,000');
      return;
    }
    if (amount > stats.balance) {
      toast.error('Insufficient balance');
      return;
    }
    if (withdrawMethod === 'zengapay' && !withdrawPhone) {
      toast.error('Please enter a phone number');
      return;
    }

    withdrawMutation.mutate(
      {
        amount,
        payment_method: withdrawMethod,
        phone_number: withdrawPhone || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Withdrawal request submitted successfully');
          setShowWithdrawModal(false);
          setWithdrawAmount('');
          setWithdrawPhone('');
        },
        onError: () => {
          toast.error('Failed to process withdrawal. Please try again.');
        },
      }
    );
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">Failed to load wallet data</p>
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
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">Manage your funds and withdrawals</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/artist/wallet/topup"
            className="flex items-center justify-center gap-2 px-6 py-2.5 border rounded-lg hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            Top Up
          </Link>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={stats.balance < 50000}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Balance */}
        <div className="md:col-span-2 p-6 rounded-xl bg-linear-to-br from-primary to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <span className="text-sm opacity-90">Available Balance</span>
            </div>
            <Shield className="h-5 w-5 opacity-60" />
          </div>
          <p className="text-4xl font-bold mb-2">UGX {stats.balance.toLocaleString()}</p>
          <div className="flex items-center gap-4 text-sm opacity-80">
            <span>Ready for withdrawal</span>
            {stats.balance >= 50000 ? (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="underline hover:no-underline"
              >
                Withdraw now
              </button>
            ) : (
              <Link
                href="/artist/wallet/topup"
                className="underline hover:no-underline"
              >
                Top up now
              </Link>
            )}
          </div>
        </div>

        {/* Pending */}
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold mb-1">UGX {stats.pending_earnings.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Being processed</p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
          <p className="text-lg font-bold">UGX {stats.total_earnings.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground mb-1">This Month</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold">UGX {stats.this_month.toLocaleString()}</p>
            {stats.monthly_change !== 0 && (
              <span className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                stats.monthly_change >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {stats.monthly_change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(stats.monthly_change)}%
              </span>
            )}
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground mb-1">Payout Method</p>
          <p className="text-lg font-bold capitalize">
            {profile?.payout_phone_number ? 'Mobile Money' : 'Not set'}
          </p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground mb-1">Payout Number</p>
          <p className="text-lg font-bold">
            {profile?.payout_phone_number || '—'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {[
            { id: 'overview' as const, label: 'Overview', icon: Wallet },
            { id: 'transactions' as const, label: 'Transactions', icon: History },
            { id: 'methods' as const, label: 'Payment Methods', icon: CreditCard },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 pb-3 border-b-2 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Sources */}
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-4">Revenue Sources</h2>
            <div className="space-y-4">
              {earningsSources.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No revenue data yet. Start uploading music to earn!
                </p>
              ) : (
                earningsSources.map((item) => (
                  <div key={item.source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{item.source}</span>
                      <span className="text-sm font-medium">UGX {item.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="p-6 rounded-xl border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent Activity</h2>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-1.5 rounded-lg',
                      tx.type === 'earning'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    )}>
                      {tx.type === 'earning' ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p className={cn(
                    'text-sm font-medium',
                    tx.amount >= 0 ? 'text-green-600' : ''
                  )}>
                    {tx.amount >= 0 ? '+' : ''}UGX {Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No transactions yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">All Transactions</h2>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="font-medium">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Your earnings and withdrawals will appear here</p>
              </div>
            ) : (
              transactions.map((tx) => (
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
                          day: 'numeric',
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
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'methods' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-4">Payment Methods</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Choose how you want to receive your earnings. You can update your payout method in Settings.
            </p>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <method.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{method.label}</p>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  {profile?.payout_phone_number && method.id === 'zengapay' && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-2">Withdrawal Info</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Minimum withdrawal: <span className="font-medium text-foreground">UGX 50,000</span></p>
              <p>• ZengaPay Mobile Money: <span className="font-medium text-foreground">Processed within 24 hours</span></p>
              <p>• Supports both MTN MoMo and Airtel Money</p>
              <p>• No withdrawal fees via ZengaPay</p>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>

            <div className="space-y-4">
              {/* Balance Display */}
              <div className="p-4 rounded-lg bg-linear-to-r from-primary/10 to-purple-500/10">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">UGX {stats.balance.toLocaleString()}</p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Amount (UGX)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount (min 50,000)"
                  min="50000"
                  max={stats.balance}
                  className="w-full px-4 py-2.5 border rounded-lg bg-background"
                />
                {/* Quick Amount Buttons */}
                <div className="flex gap-2 mt-2">
                  {quickAmounts.filter(a => a <= stats.balance).map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setWithdrawAmount(String(amount))}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full border transition-colors',
                        withdrawAmount === String(amount)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      {amount >= 1000000 ? `${amount / 1000000}M` : `${amount / 1000}K`}
                    </button>
                  ))}
                  {stats.balance >= 50000 && (
                    <button
                      onClick={() => setWithdrawAmount(String(stats.balance))}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full border transition-colors',
                        withdrawAmount === String(stats.balance)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      Max
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Withdrawal Method</label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setWithdrawMethod(method.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                        withdrawMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      )}
                    >
                      <method.icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{method.label}</p>
                      </div>
                      {withdrawMethod === method.id && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              {withdrawMethod === 'zengapay' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={withdrawPhone || profile?.payout_phone_number || ''}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    placeholder="0700 000 000"
                    className="w-full px-4 py-2.5 border rounded-lg bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your MTN or Airtel number. ZengaPay will process it automatically.
                  </p>
                </div>
              )}

              {/* Info */}
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
                className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-muted"
                disabled={withdrawMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={
                  withdrawMutation.isPending ||
                  !withdrawAmount ||
                  parseInt(withdrawAmount) < 50000 ||
                  parseInt(withdrawAmount) > stats.balance
                }
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
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
