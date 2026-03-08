'use client';

import { useState, useMemo } from 'react';
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
  AlertCircle,
  Users,
  Music,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistEarnings, useRequestWithdrawal, useRoyaltySplits, usePerSongEarnings, type SongEarning } from '@/hooks/useArtist';

export default function ArtistEarningsPage() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'zengapay'>('zengapay');
  const [withdrawPhone, setWithdrawPhone] = useState('');

  const { data: earningsData, isLoading, error } = useArtistEarnings();
  const withdrawMutation = useRequestWithdrawal();
  const { data: royaltySplits, isLoading: splitsLoading } = useRoyaltySplits();
  const { data: songEarningsData, isLoading: songEarningsLoading } = usePerSongEarnings({ per_page: 10, sort: 'total_revenue' });
  const songEarnings: SongEarning[] = songEarningsData?.data || [];

  const stats = earningsData?.stats || {
    balance: 0,
    pending_earnings: 0,
    total_earnings: 0,
    this_month: 0,
    monthly_change: 0
  };

  const earningsSources = earningsData?.earnings_sources || [];
  const transactions = earningsData?.transactions || [];

  // Build monthly chart from API data or derive from transactions
  const monthlyChart = useMemo(() => {
    if (earningsData?.monthly_chart && earningsData.monthly_chart.length > 0) {
      return earningsData.monthly_chart;
    }
    // Derive from transactions if monthly_chart not available
    const monthMap = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short' });
      monthMap.set(key, 0);
    }
    for (const tx of transactions) {
      if (tx.type === 'earning' && tx.status === 'completed') {
        const txDate = new Date(tx.date);
        const key = txDate.toLocaleString('en-US', { month: 'short' });
        if (monthMap.has(key)) {
          monthMap.set(key, (monthMap.get(key) || 0) + tx.amount);
        }
      }
    }
    return Array.from(monthMap.entries()).map(([month, amount]) => ({ month, amount }));
  }, [earningsData?.monthly_chart, transactions]);

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
            {(() => {
              const maxAmount = Math.max(...monthlyChart.map(m => m.amount), 1);
              return monthlyChart.map((item, i) => {
                const height = maxAmount > 0 ? Math.max((item.amount / maxAmount) * 100, 4) : 4;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2" title={`UGX ${item.amount.toLocaleString()}`}>
                    <div
                      className={cn(
                        'w-full rounded-t transition-colors',
                        i === monthlyChart.length - 1 ? 'bg-primary' : 'bg-primary/40 hover:bg-primary/60'
                      )}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{item.month}</span>
                  </div>
                );
              });
            })()}
          </div>
          {monthlyChart.every(m => m.amount === 0) && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              No earnings data to display yet
            </p>
          )}
        </div>
      </div>

      {/* Revenue Type Breakdown */}
      {earningsSources.length > 0 && (
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            Revenue by Type
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {earningsSources.map((item) => {
              const colorMap: Record<string, string> = {
                streams: 'bg-blue-500',
                stream: 'bg-blue-500',
                downloads: 'bg-green-500',
                download: 'bg-green-500',
                tips: 'bg-amber-500',
                tip: 'bg-amber-500',
                distribution: 'bg-purple-500',
                sale: 'bg-rose-500',
              };
              const bgMap: Record<string, string> = {
                streams: 'bg-blue-50 dark:bg-blue-950',
                stream: 'bg-blue-50 dark:bg-blue-950',
                downloads: 'bg-green-50 dark:bg-green-950',
                download: 'bg-green-50 dark:bg-green-950',
                tips: 'bg-amber-50 dark:bg-amber-950',
                tip: 'bg-amber-50 dark:bg-amber-950',
                distribution: 'bg-purple-50 dark:bg-purple-950',
                sale: 'bg-rose-50 dark:bg-rose-950',
              };
              const key = item.source.toLowerCase();
              const bar = colorMap[key] ?? 'bg-primary';
              const bg = bgMap[key] ?? 'bg-muted';
              return (
                <div key={item.source} className={cn('p-4 rounded-xl', bg)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium capitalize text-muted-foreground">{item.source}</span>
                    <span className="text-xs font-semibold">{item.percentage}%</span>
                  </div>
                  <p className="text-base font-bold">UGX {item.amount.toLocaleString()}</p>
                  <div className="mt-2 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', bar)} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Royalty Splits */}
      <div className="p-6 rounded-xl border bg-card">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Collaborator Royalty Splits
        </h2>
        {splitsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !royaltySplits?.length ? (
          <div className="py-8 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No royalty splits configured for your songs.</p>
            <p className="text-xs mt-1">Add collaborators when uploading songs to share revenue automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Song</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Collaborator</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Share</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Total Earned</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Pending</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {royaltySplits.map((split) => (
                  <tr key={split.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 max-w-[140px] truncate">{split.song_title}</td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium truncate max-w-[120px]">{split.recipient_name}</p>
                        {split.recipient_email && (
                          <p className="text-xs text-muted-foreground truncate max-w-[120px]">{split.recipient_email}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold">{split.percentage}%</td>
                    <td className="py-3 text-right">UGX {split.total_earned.toLocaleString()}</td>
                    <td className="py-3 text-right">UGX {split.pending_payout.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        split.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : split.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {split.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Per-Song Revenue */}
      <div className="p-6 rounded-xl border bg-card">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Music className="h-4 w-4 text-muted-foreground" />
          Revenue by Song
        </h2>
        {songEarningsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : songEarnings.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Music className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No song earnings data yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Song</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Streams</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Downloads</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Tips</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {songEarnings.map((song) => (
                  <tr key={song.song_id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {song.artwork_url ? (
                          <img
                            src={song.artwork_url}
                            alt={song.title}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                            <Music className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[180px]">{song.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {song.play_count.toLocaleString()} plays · {song.download_count.toLocaleString()} downloads
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right">UGX {song.streams_revenue.toLocaleString()}</td>
                    <td className="py-3 text-right">UGX {song.downloads_revenue.toLocaleString()}</td>
                    <td className="py-3 text-right">UGX {song.tips_revenue.toLocaleString()}</td>
                    <td className="py-3 text-right font-semibold">UGX {song.total_revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                <div className="w-full px-4 py-2 border rounded-lg bg-background flex items-center gap-2">
                  <span className="font-medium">ZengaPay Mobile Money</span>
                  <span className="text-xs text-muted-foreground ml-auto">MTN & Airtel</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="0700 000 000"
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your MTN or Airtel number. ZengaPay will process it automatically.
                </p>
              </div>

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
