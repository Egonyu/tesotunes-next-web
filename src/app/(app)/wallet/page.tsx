'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Gift,
  ChevronRight,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet, useWalletTransactions, useWithdraw, formatPhoneNumber, normalizePhoneNumber } from '@/hooks/usePayments';
import { useWalletPinGuard } from '@/hooks/useWalletPin';
import { WalletPinModal } from '@/components/wallet/wallet-pin-modal';
import { InFlightMoney } from '@/components/wallet/in-flight-money';
import { toast } from 'sonner';

export default function WalletPage() {
  // Withdraw modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');

  // Fetch wallet data
  const { data: wallet, isLoading } = useWallet();

  // Fetch recent transactions
  const { data: transactionsData } = useWalletTransactions(1, 5);

  // Withdraw mutation
  const withdrawMutation = useWithdraw();

  // Wallet PIN challenge handling (raises the modal, then retries the action)
  const { runGuarded, pinModal } = useWalletPinGuard();

  const recentTransactions = transactionsData?.data || [];

  const balance = wallet?.balance || 0;
  const creditsBalance = wallet?.credits_balance || 0;
  const inFlight = wallet?.in_flight ?? [];

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount.replace(/\D/g, ''));

    if (!amount || amount < 1000) {
      toast.error('Minimum withdrawal is UGX 1,000');
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    const cleanPhone = withdrawPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      // Guarded: if the wallet PIN is required, the modal is raised and this
      // withdrawal is retried automatically once the PIN is set/verified.
      const result = await runGuarded(() =>
        withdrawMutation.mutateAsync({
          amount,
          phone: normalizePhoneNumber(withdrawPhone),
          provider: 'zengapay',
        }),
      );

      if (result === undefined) return;

      toast.success('Withdrawal initiated! You will receive your funds shortly.');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawPhone('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process withdrawal';
      toast.error(errorMessage);
    }
  };

  // Top-up moved into the primary thumb row above, so it is not repeated here.
  // "Cards" was removed with the rest of the dead surfaces: /wallet/cards has
  // never existed, so the link was a 404.
  const quickActions = [
    { label: 'Credits', icon: Gift, href: '/credits', color: 'bg-purple-500' },
    { label: 'History', icon: History, href: '/wallet/history', color: 'bg-blue-500' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">My Wallet</h1>
      </div>

      {/*
        Balance card — credits lead because credits are what people actually
        hold here (on production: 67 users hold credits, 4 hold shillings), and
        earnings from listening, tips and corpus contributions all settle in
        credits. Cash sits beneath as the secondary line. Flat fills, no
        gradient.
      */}
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Credits
        </p>
        <p className="mt-1 text-4xl font-bold tabular-nums">
          {creditsBalance.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Earned on TesoTunes — spend on the platform, or cash out after verification.
        </p>

        <div className="mt-4 flex items-baseline justify-between border-t border-primary/20 pt-3">
          <span className="text-sm text-muted-foreground">Cash balance</span>
          <span className="font-semibold tabular-nums">UGX {balance.toLocaleString()}</span>
        </div>
      </div>

      {/* Anything committed but not landed, before the actions — so a stuck
          payment is seen before another one is started on top of it. */}
      <InFlightMoney payments={inFlight} />

      {/* The two money actions, full width and thumb-reachable on a phone. */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/wallet/topup"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowDownCircle className="h-5 w-5" />
          Add money
        </Link>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border bg-card px-4 font-medium transition-colors hover:bg-muted"
        >
          <ArrowUpCircle className="h-5 w-5" />
          Cash out
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className={cn('p-3 rounded-full text-white', action.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/*
        Removed here, deliberately:

        - "This Month" / "Spent" tiles. They summed whatever happened to be in
          the five most recently fetched transactions and labelled it a monthly
          total, so the figure was wrong for anyone active and got worse the
          more they used the wallet. A missing number beats a false one; these
          come back when the API exposes real month-to-date aggregates.
        - "Payment Methods". The list was a hardcoded empty array and the
          "Add New" button had no handler, so the card could never show or do
          anything.
      */}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Transactions</h2>
          <Link
            href="/wallet/history"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="rounded-xl border bg-card overflow-hidden divide-y">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-full',
                    tx.type === 'credit'
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  )}>
                    {tx.type === 'credit' ? (
                      <ArrowDownCircle className="h-5 w-5" />
                    ) : (
                      <ArrowUpCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(tx.created_at)}</p>
                  </div>
                </div>
                <p className={cn(
                  'font-semibold',
                  tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : ''
                )}>
                  {tx.type === 'credit' ? '+' : '-'} UGX {tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border bg-card">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowWithdrawModal(false)}
          />
          <div className="relative bg-background rounded-2xl p-6 w-full max-w-md mx-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Withdraw Funds</h2>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Available Balance */}
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">UGX {balance.toLocaleString()}</p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Amount (UGX)</label>
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-lg border bg-background"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-sm font-medium mb-2 block">ZengaPay Mobile Money Number</label>
                <input
                  type="tel"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="e.g., 0772123456"
                  className="w-full px-4 py-3 rounded-lg border bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the phone number where ZengaPay should send the withdrawal prompt.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className={cn(
                  'flex-1 py-3 rounded-lg font-medium transition-colors',
                  withdrawMutation.isPending
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {withdrawMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet PIN — setup or verification, raised when a transaction needs it */}
      <WalletPinModal {...pinModal} />
    </div>
  );
}
