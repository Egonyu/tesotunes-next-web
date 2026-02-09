'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  CreditCard,
  Smartphone,
  Gift,
  TrendingUp,
  ChevronRight,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet } from '@/lib/api';
import { useWithdraw, detectProvider, formatPhoneNumber } from '@/hooks/usePayments';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletData {
  balance: number;
  pending_balance: number;
  currency: string;
  currency_symbol: string;
  monthly_topups: number;
  monthly_spent: number;
}

interface PaymentMethod {
  id: number;
  type: string;
  provider: string;
  masked_number: string;
  is_default: boolean;
}

interface WalletResponse {
  data: WalletData;
  payment_methods: PaymentMethod[];
}

interface TransactionsResponse {
  data: Transaction[];
}

export default function WalletPage() {
  // Withdraw modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawProvider, setWithdrawProvider] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');
  
  // Fetch wallet data
  const { data: walletData, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiGet<WalletResponse>('/payments/wallet'),
  });
  
  // Fetch recent transactions
  const { data: transactionsData } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => apiGet<TransactionsResponse>('/payments/wallet/transactions?limit=5'),
  });
  
  // Withdraw mutation
  const withdrawMutation = useWithdraw();
  
  const wallet = walletData?.data;
  const paymentMethods = walletData?.payment_methods || [];
  const recentTransactions = transactionsData?.data || [];
  
  const balance = wallet?.balance || 0;
  const pendingBalance = wallet?.pending_balance || 0;
  const monthlyTopups = wallet?.monthly_topups || 0;
  const monthlySpent = wallet?.monthly_spent || 0;
  
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
    
    const detectedProvider = detectProvider(cleanPhone);
    if (detectedProvider === 'unknown') {
      toast.error('Could not detect provider from phone number');
      return;
    }
    
    try {
      await withdrawMutation.mutateAsync({
        amount,
        phone: formatPhoneNumber(withdrawPhone),
        provider: detectedProvider,
      });
      
      toast.success('Withdrawal initiated! You will receive your funds shortly.');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawPhone('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process withdrawal';
      toast.error(errorMessage);
    }
  };
  
  const quickActions = [
    { label: 'Top Up', icon: Plus, href: '/wallet/topup', color: 'bg-green-500' },
    { label: 'Credits', icon: Gift, href: '/credits', color: 'bg-purple-500' },
    { label: 'History', icon: History, href: '/wallet/history', color: 'bg-blue-500' },
    { label: 'Cards', icon: CreditCard, href: '/wallet/cards', color: 'bg-orange-500' },
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
      
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-sm opacity-80">Available Balance</p>
          <p className="text-4xl font-bold mt-1">
            UGX {balance.toLocaleString()}
          </p>
          {pendingBalance > 0 && (
            <p className="text-sm mt-2 opacity-80">
              + UGX {pendingBalance.toLocaleString()} pending
            </p>
          )}
          <div className="flex gap-3 mt-6">
            <Link
              href="/wallet/topup"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <ArrowDownCircle className="h-5 w-5" />
              Top Up
            </Link>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <ArrowUpCircle className="h-5 w-5" />
              Withdraw
            </button>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
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
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-green-500" />
            This Month
          </div>
          <p className="text-xl font-bold mt-1">
            UGX {monthlyTopups.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Total top-ups</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpCircle className="h-4 w-4 text-blue-500" />
            Spent
          </div>
          <p className="text-xl font-bold mt-1">
            UGX {monthlySpent.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">This month</p>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="p-4 rounded-xl border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Payment Methods</h2>
          <button className="text-sm text-primary hover:underline">Add New</button>
        </div>
        <div className="space-y-3">
          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    method.provider.toLowerCase().includes('mtn') ? 'bg-yellow-500' : 'bg-red-500'
                  )}>
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{method.provider}</p>
                    <p className="text-sm text-muted-foreground">{method.masked_number}</p>
                  </div>
                </div>
                {method.is_default && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
                    Primary
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No payment methods added yet
            </p>
          )}
        </div>
      </div>
      
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
                <label className="text-sm font-medium mb-2 block">Mobile Money Number</label>
                <input
                  type="tel"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="e.g., 0772123456"
                  className="w-full px-4 py-3 rounded-lg border bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  MTN or Airtel Money number to receive funds
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
    </div>
  );
}
