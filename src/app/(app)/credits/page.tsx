'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Coins,
  ArrowRight,
  Wallet,
  Zap,
  Gift,
  History,
  ChevronLeft,
  Check,
  Star,
  Vote,
  Heart,
  Music,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet, apiPost } from '@/lib/api';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

interface CreditBalance {
  credits: number;
  wallet_balance: number;
  currency: string;
  rate: number; // credits per 1 UGX (e.g., 100 credits = 1000 UGX -> rate=0.1)
  min_purchase: number;
  max_purchase: number;
}

interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  bonus_credits: number;
  is_popular: boolean;
}

interface CreditTransaction {
  id: number;
  type: 'purchase' | 'spent' | 'earned' | 'bonus' | 'refund';
  credits: number;
  description: string;
  created_at: string;
}

// ============================================================================
// Component
// ============================================================================

export default function CreditsPage() {
  const queryClient = useQueryClient();
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: balance, isLoading } = useQuery({
    queryKey: ['credits', 'balance'],
    queryFn: () => apiGet<CreditBalance>('/credits/balance'),
  });

  const { data: packages } = useQuery({
    queryKey: ['credits', 'packages'],
    queryFn: () => apiGet<CreditPackage[]>('/credits/packages'),
  });

  const { data: history } = useQuery({
    queryKey: ['credits', 'history'],
    queryFn: () => apiGet<CreditTransaction[]>('/credits/history'),
    enabled: showHistory,
  });

  const purchaseCredits = useMutation({
    mutationFn: (data: { package_id?: number; custom_amount?: number }) =>
      apiPost<{ credits_added: number; new_balance: number }>('/credits/purchase', data),
    onSuccess: (result) => {
      toast.success(`${formatNumber(result.credits_added)} credits added!`);
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      setCustomAmount('');
      setSelectedPackage(null);
    },
    onError: () => toast.error('Failed to purchase credits. Check your wallet balance.'),
  });

  const handlePurchasePackage = (pkg: CreditPackage) => {
    setSelectedPackage(pkg.id);
    purchaseCredits.mutate({ package_id: pkg.id });
  };

  const handleCustomPurchase = () => {
    const amount = parseInt(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    purchaseCredits.mutate({ custom_amount: amount });
  };

  const useCases = [
    { icon: Vote, label: 'Vote in Awards', desc: 'Cast votes for your favorite artists' },
    { icon: Heart, label: 'Send Tips', desc: 'Support artists with credit tips' },
    { icon: Gift, label: 'Send Gifts', desc: 'Gift credits to friends' },
    { icon: Music, label: 'Unlock Content', desc: 'Access premium exclusive content' },
  ];

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
            <h1 className="text-4xl font-bold">{formatNumber(balance?.credits || 0)}</h1>
            <p className="text-muted-foreground mt-1">Available Credits</p>
          </div>
          <div className="bg-card/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span>Wallet: {formatCurrency(balance?.wallet_balance || 0)}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-purple-500" />
                <span>Rate: {balance?.rate || 0.1} cr/{balance?.currency || 'UGX'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div>
        <h2 className="text-xl font-bold mb-4">Buy Credits</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {packages?.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handlePurchasePackage(pkg)}
              disabled={purchaseCredits.isPending}
              className={cn(
                'relative rounded-xl border bg-card p-6 text-left transition-all hover:shadow-lg hover:border-primary/50',
                pkg.is_popular && 'ring-2 ring-purple-500 border-purple-500/20',
                selectedPackage === pkg.id && purchaseCredits.isPending && 'opacity-50',
              )}
            >
              {pkg.is_popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-purple-500 text-white px-3 py-0.5 rounded-full">
                  POPULAR
                </span>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Coins className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold">{formatNumber(pkg.credits)}</span>
              </div>
              {pkg.bonus_credits > 0 && (
                <div className="flex items-center gap-1 mb-2 text-sm text-green-500">
                  <Zap className="h-3.5 w-3.5" />
                  +{formatNumber(pkg.bonus_credits)} bonus
                </div>
              )}
              <p className="text-lg font-semibold">{formatCurrency(pkg.price)}</p>
              <p className="text-xs text-muted-foreground mt-1">{pkg.name}</p>
              {selectedPackage === pkg.id && purchaseCredits.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-xl">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </button>
          ))}

          {/* Custom Amount */}
          <div className="rounded-xl border bg-card p-6">
            <h4 className="font-medium mb-3">Custom Amount</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`Min ${balance?.min_purchase || 100}`}
                className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleCustomPurchase}
                disabled={!customAmount || purchaseCredits.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50"
              >
                Buy
              </button>
            </div>
            {customAmount && balance && (
              <p className="text-xs text-muted-foreground mt-2">
                ≈ {formatNumber(Math.floor(parseInt(customAmount) * balance.rate))} credits
              </p>
            )}
          </div>
        </div>
      </div>

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
            {!history?.length ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No credit transactions yet</div>
            ) : history.map((tx) => {
              const isPositive = ['purchase', 'earned', 'bonus', 'refund'].includes(tx.type);
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
                    <p className="text-xs text-muted-foreground capitalize">{tx.type} • {formatDate(tx.created_at)}</p>
                  </div>
                  <span className={cn('font-medium', isPositive ? 'text-green-500' : 'text-red-500')}>
                    {isPositive ? '+' : '-'}{formatNumber(Math.abs(tx.credits))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
