'use client';

import { useState } from 'react';
import { 
  Coins, 
  TrendingUp, 
  Users,
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  X,
  AlertCircle,
  Loader2,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSaccoShares, useBuyShares, useSaccoDividends } from '@/hooks/useSacco';
import { toast } from 'sonner';

// View-layer interfaces
interface SharesData {
  total_shares: number;
  price_per_share: number;
  total_value: number;
  dividend_rate: number;
  last_dividend: number;
  next_dividend_date: string;
  total_members: number;
  total_share_capital: number;
}

interface ShareTransaction {
  id: number;
  type: 'buy' | 'sell' | 'dividend';
  shares?: number;
  amount: number;
  price_per_share?: number;
  date: string;
}

export default function SharesPage() {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');

  const { data: sharesResponse, isLoading, error } = useSaccoShares();
  const { data: dividendsData } = useSaccoDividends();
  const buySharesMutation = useBuyShares();
  
  const dividendRate = dividendsData && dividendsData.length > 0 ? dividendsData[0].rate : 8;
  const lastDividend = dividendsData && dividendsData.length > 0 ? dividendsData[0].amount : 0;
  const nextDividendDate = dividendsData && dividendsData.length > 0 && dividendsData[0].paid_at
    ? '' : 'December 2026';
  
  const sharesData = {
    total_shares: sharesResponse?.total_shares ?? 0,
    price_per_share: sharesResponse?.share_value ?? 10000,
    total_value: sharesResponse?.total_value ?? 0,
    dividend_rate: dividendRate,
    last_dividend: lastDividend,
    next_dividend_date: nextDividendDate,
  };
  
  const transactions: ShareTransaction[] = sharesResponse?.purchases?.map((p) => ({
    id: p.id,
    type: 'buy' as const,
    shares: p.quantity,
    amount: p.amount,
    price_per_share: p.amount / p.quantity,
    date: p.date,
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load shares</h2>
        <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shares</h2>
          <p className="text-muted-foreground">
            Own a piece of TesoTunes SACCO
          </p>
        </div>
        <button 
          onClick={() => setShowBuyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Buy Shares
        </button>
      </div>
      
      {/* Share Value Card */}
      <div className="p-6 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-blue-100">Your Share Value</p>
            <p className="text-4xl font-bold mt-1">
              UGX {sharesData.total_value.toLocaleString()}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Coins className="h-6 w-6" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-blue-100 text-sm">Total Shares</p>
            <p className="text-xl font-semibold">{sharesData.total_shares}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Price per Share</p>
            <p className="text-xl font-semibold">UGX {sharesData.price_per_share.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Dividend Rate</p>
            <p className="text-xl font-semibold">{sharesData.dividend_rate}% p.a.</p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Dividend Information */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">Dividends</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Last Dividend Received</p>
              <p className="text-2xl font-bold text-green-600">
                UGX {sharesData.last_dividend.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">December 2025</p>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Next Dividend Date</p>
                <p className="text-sm text-muted-foreground">
                  {sharesData.next_dividend_date || 'Date to be announced'}
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                <strong>Projected Dividend:</strong> Based on your {sharesData.total_shares} shares 
                at {sharesData.dividend_rate}% rate, expected dividend: 
                UGX {Math.round(sharesData.total_value * sharesData.dividend_rate / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* SACCO Stats */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">SACCO Statistics</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Share Benefits</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Annual dividends based on profits</li>
                  <li>• Voting rights at AGM</li>
                  <li>• Higher loan eligibility</li>
                  <li>• Share appreciation over time</li>
                </ul>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Estimated Annual Dividend</p>
              <p className="text-xl font-bold text-emerald-600">UGX {Math.round(sharesData.total_value * sharesData.dividend_rate / 100).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Based on {sharesData.dividend_rate}% rate and {sharesData.total_shares} shares</p>
            </div>
            
            <div className="p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Share Benefits</p>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>• Annual dividends based on profits</li>
                    <li>• Voting rights at AGM</li>
                    <li>• Higher loan eligibility</li>
                    <li>• Share appreciation over time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction History */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Share History</h3>
        </div>
        <div className="divide-y">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No share transactions yet</div>
          ) : transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center',
                  tx.type === 'dividend'
                    ? 'bg-purple-100 dark:bg-purple-900/30'
                    : tx.type === 'buy'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-orange-100 dark:bg-orange-900/30'
                )}>
                  {tx.type === 'dividend' ? (
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  ) : tx.type === 'buy' ? (
                    <ArrowDownRight className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {tx.type === 'buy' ? `Purchased ${tx.shares} shares` : 
                     tx.type === 'sell' ? `Sold ${tx.shares} shares` :
                     'Dividend received'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString()}
                    {tx.price_per_share && ` • UGX ${tx.price_per_share.toLocaleString()}/share`}
                  </p>
                </div>
              </div>
              <p className={cn(
                'font-semibold',
                tx.type === 'sell' ? 'text-green-600' : 
                tx.type === 'dividend' ? 'text-purple-600' : 
                'text-blue-600'
              )}>
                {tx.type === 'sell' || tx.type === 'dividend' ? '+' : '-'}
                UGX {tx.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Buy Shares Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Buy Shares</h3>
              <button 
                onClick={() => {
                  setShowBuyModal(false);
                  setSharesToBuy(1);
                }}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Current Holdings */}
              <div className="p-4 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white">
                <p className="text-blue-100 text-sm">Your Current Shares</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold">{sharesData.total_shares}</p>
                  <p className="text-blue-100">shares</p>
                </div>
                <p className="text-blue-100 text-sm mt-1">
                  Value: UGX {sharesData.total_value.toLocaleString()}
                </p>
              </div>

              {/* Number of Shares */}
              <div>
                <label className="block text-sm font-medium mb-3">Number of Shares to Buy</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSharesToBuy(Math.max(1, sharesToBuy - 1))}
                    className="h-12 w-12 rounded-lg border text-xl font-bold hover:bg-muted"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={sharesToBuy}
                    onChange={(e) => setSharesToBuy(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className="w-24 text-center text-2xl font-bold py-2 border rounded-lg bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setSharesToBuy(sharesToBuy + 1)}
                    className="h-12 w-12 rounded-lg border text-xl font-bold hover:bg-muted"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick Select */}
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSharesToBuy(num)}
                    className={cn(
                      'py-2 text-sm rounded-lg border transition-colors',
                      sharesToBuy === num
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:border-foreground'
                    )}
                  >
                    {num} shares
                  </button>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per Share</span>
                  <span className="font-medium">UGX {sharesData.price_per_share.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number of Shares</span>
                  <span className="font-medium">{sharesToBuy}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total Cost</span>
                  <span className="text-xl font-bold">UGX {(sharesToBuy * sharesData.price_per_share).toLocaleString()}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Share purchases are permanent. Shares can only be sold back to the SACCO 
                    with board approval.
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn_momo')}
                    className={cn(
                      'p-3 rounded-lg border flex flex-col items-center gap-2',
                      paymentMethod === 'mtn_momo'
                        ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                        : 'hover:border-foreground'
                    )}
                  >
                    <Phone className="h-5 w-5 text-yellow-500" />
                    <span className="text-xs">MTN MoMo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('airtel_money')}
                    className={cn(
                      'p-3 rounded-lg border flex flex-col items-center gap-2',
                      paymentMethod === 'airtel_money'
                        ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                        : 'hover:border-foreground'
                    )}
                  >
                    <Phone className="h-5 w-5 text-red-500" />
                    <span className="text-xs">Airtel Money</span>
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit */}
              <button
                disabled={buySharesMutation.isPending || !phoneNumber}
                onClick={() => {
                  buySharesMutation.mutate(
                    { quantity: sharesToBuy, phone_number: phoneNumber, payment_method: paymentMethod },
                    {
                      onSuccess: () => {
                        toast.success(`Successfully purchased ${sharesToBuy} shares!`);
                        setShowBuyModal(false);
                        setSharesToBuy(1);
                        setPhoneNumber('');
                      },
                      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to purchase shares'),
                    }
                  );
                }}
                className={cn(
                  'w-full py-3 rounded-lg font-medium transition-colors',
                  buySharesMutation.isPending || !phoneNumber
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {buySharesMutation.isPending ? 'Processing...' : `Purchase ${sharesToBuy} Shares`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
