'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle,
  ChevronLeft,
  Coins,
  Loader2,
  Shield,
  Smartphone,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatPhoneNumber,
  formatUGX,
  normalizePhoneNumber,
  useCreditBalance,
  useDeposit,
  usePaymentStatus,
  usePurchaseCredits,
} from '@/hooks/usePayments';
import { toast } from 'sonner';

type TopupMode = 'ugx' | 'credits';

export default function ArtistTopUpPage() {
  const [topupMode, setTopupMode] = useState<TopupMode>('ugx');
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'input' | 'processing' | 'success' | 'failed'>('input');

  const depositMutation = useDeposit();
  const purchaseCreditsMutation = usePurchaseCredits();
  const { data: balances } = useCreditBalance();

  const { data: paymentStatus } = usePaymentStatus(transactionRef || '', {
    enabled: !!transactionRef && paymentStep === 'processing',
    refetchInterval: transactionRef && paymentStep === 'processing' ? 3000 : undefined,
  });

  const ugxPresets = [10000, 25000, 50000, 100000, 200000, 500000];
  const creditsPresets = [100, 500, 1000, 2500, 5000, 10000];
  const presetAmounts = topupMode === 'ugx' ? ugxPresets : creditsPresets;
  const currencyLabel = topupMode === 'ugx' ? 'UGX' : 'Credits';
  const minAmount = topupMode === 'ugx' ? 1000 : 10;
  const selectedAmount = amount || 0;
  const ugxPerCredit = balances?.exchange_rate?.ugx_per_credit ?? 1;
  const walletCharge = topupMode === 'credits'
    ? Math.max(1, Math.round(selectedAmount * ugxPerCredit))
    : selectedAmount;
  const walletBalance = balances?.wallet_balance ?? 0;
  const creditsBalance = balances?.credits ?? 0;
  const insufficientWalletForCredits = topupMode === 'credits' && selectedAmount > 0 && walletCharge > walletBalance;
  const isProcessing = paymentStep === 'processing' || depositMutation.isPending || purchaseCreditsMutation.isPending;

  const modeSummary = useMemo(() => {
    if (topupMode === 'ugx') {
      return 'Top up your artist wallet through ZengaPay, then use that balance for payouts, promotions, and other purchases.';
    }

    return 'Convert artist wallet balance into credits instantly for campaign boosts, premium actions, and other credit-based flows.';
  }, [topupMode]);

  useEffect(() => {
    if (paymentStatus?.status === 'completed') {
      setPaymentStep('success');
      toast.success('Payment successful! Your wallet has been topped up.');
    } else if (paymentStatus?.status === 'failed') {
      setPaymentStep('failed');
      toast.error('Payment failed. Please try again.');
    }
  }, [paymentStatus]);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount(value.toLocaleString());
  };

  const handleCustomAmount = (value: string) => {
    const numeric = parseInt(value.replace(/\D/g, ''), 10);
    setCustomAmount(value);
    setAmount(Number.isFinite(numeric) ? numeric : null);
  };

  const handleModeSwitch = (mode: TopupMode) => {
    setTopupMode(mode);
    setAmount(null);
    setCustomAmount('');
    setPaymentStep('input');
    setTransactionRef(null);
  };

  const validatePhone = () => {
    const normalized = normalizePhoneNumber(phoneNumber);
    if (normalized.length !== 12) {
      toast.error('Enter a valid Ugandan phone number.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!amount || amount < minAmount) {
      toast.error(`Minimum amount is ${currencyLabel} ${minAmount.toLocaleString()}`);
      return;
    }

    if (topupMode === 'ugx') {
      if (!validatePhone()) {
        return;
      }

      setPaymentStep('processing');

      try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        const result = await depositMutation.mutateAsync({
          amount,
          phone: normalizedPhone,
        });

        const autoCompleted =
          result.status === 'completed' ||
          result.message?.toLowerCase().includes('auto-completed') ||
          result.message?.toLowerCase().includes('balance updated');

        if (autoCompleted) {
          setPaymentStep('success');
          setTransactionRef(result.transaction_ref ?? null);
          toast.success('Payment successful! Your wallet has been topped up.');
        } else if (result.transaction_ref) {
          setTransactionRef(result.transaction_ref);
          toast.info('Check your phone to approve the ZengaPay payment prompt.');
        } else {
          setPaymentStep('success');
          toast.success('Payment initiated successfully.');
        }
      } catch (error: unknown) {
        setPaymentStep('failed');
        toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
      }

      return;
    }

    if (insufficientWalletForCredits) {
      toast.error('Top up your artist wallet first to buy this amount of credits.');
      return;
    }

    setPaymentStep('processing');

    try {
      await purchaseCreditsMutation.mutateAsync({
        credits_amount: amount,
      });

      setPaymentStep('success');
      toast.success('Credits purchased successfully!');
    } catch (error: unknown) {
      setPaymentStep('failed');
      toast.error(error instanceof Error ? error.message : 'Failed to purchase credits');
    }
  };

  const handleRetry = () => {
    setPaymentStep('input');
    setTransactionRef(null);
  };

  if (paymentStep === 'success') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">
            {topupMode === 'ugx' ? 'Wallet Topped Up' : 'Credits Purchased'}
          </h2>
          <p className="text-muted-foreground">
            {topupMode === 'ugx'
              ? `${formatUGX(selectedAmount)} has been added to your artist wallet.`
              : `${selectedAmount.toLocaleString()} credits are now available for your account.`}
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link
              href="/artist/wallet"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Go to Wallet
            </Link>
            {topupMode === 'credits' ? (
              <Link
                href="/credits"
                className="px-6 py-3 border rounded-lg font-medium"
              >
                View Credits
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === 'failed') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">Payment Failed</h2>
          <p className="text-muted-foreground">Something went wrong. Please try again.</p>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Try Again
            </button>
            <Link
              href="/artist/wallet"
              className="px-6 py-3 border rounded-lg font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === 'processing' && transactionRef) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold">Awaiting ZengaPay Confirmation</h2>
          <p className="text-muted-foreground">
            Complete the mobile money prompt on your phone to finish the wallet top-up.
          </p>
          <div className="p-4 bg-muted rounded-lg max-w-xs mx-auto">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-xl font-bold">{formatUGX(selectedAmount)}</p>
          </div>
          <button
            onClick={handleRetry}
            className="text-sm text-muted-foreground hover:underline"
          >
            Cancel and try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/artist/wallet" className="p-2 hover:bg-muted rounded-lg">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Top Up Wallet</h1>
          <p className="text-sm text-muted-foreground">Manage ZengaPay wallet funding and credit conversion for artist tools</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Wallet</p>
              <p className="mt-1 text-xl font-bold">{formatUGX(walletBalance)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Credits</p>
              <p className="mt-1 text-xl font-bold">{creditsBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex rounded-xl border bg-card overflow-hidden">
            <button
              onClick={() => handleModeSwitch('ugx')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors',
                topupMode === 'ugx' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <Wallet className="h-5 w-5" />
              <span>UGX Wallet</span>
            </button>
            <button
              onClick={() => handleModeSwitch('credits')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors',
                topupMode === 'credits' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <Coins className="h-5 w-5" />
              <span>Credits</span>
            </button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            {modeSummary}
          </div>

          <div className="p-6 rounded-xl border bg-card text-center">
            <p className="text-sm text-muted-foreground mb-1">Amount</p>
            <p className="text-3xl font-bold">
              {topupMode === 'ugx'
                ? formatUGX(selectedAmount)
                : `${selectedAmount.toLocaleString()} credits`}
            </p>
            {topupMode === 'credits' && selectedAmount > 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Wallet debit: {formatUGX(walletCharge)}</p>
            ) : null}
          </div>

          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-4">Select Amount</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleAmountSelect(preset)}
                  className={cn(
                    'py-3 rounded-lg font-medium transition-colors text-sm',
                    amount === preset ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'
                  )}
                >
                  {topupMode === 'ugx' ? formatUGX(preset) : preset.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {currencyLabel}
              </span>
              <input
                type="text"
                value={customAmount}
                onChange={(event) => handleCustomAmount(event.target.value)}
                placeholder="Enter custom amount"
                className="w-full pl-16 pr-4 py-3 rounded-lg border bg-background"
              />
            </div>
          </div>

          {topupMode === 'ugx' ? (
            <>
              <div className="p-6 rounded-xl border bg-card">
                <h2 className="font-semibold mb-4">Payment Method</h2>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-primary bg-primary/5">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-green-600">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">ZengaPay Mobile Money</p>
                    <p className="text-sm text-muted-foreground">Single gateway for artist wallet top-ups</p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border bg-card">
                <h2 className="font-semibold mb-4">Phone Number</h2>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="e.g., 0772123456"
                  className="w-full px-4 py-3 rounded-lg border bg-background"
                />
                {phoneNumber ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    Preview: {formatPhoneNumber(phoneNumber)}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="p-6 rounded-xl border bg-card space-y-4">
              <h2 className="font-semibold">Exchange Details</h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wallet charge</span>
                <span className="font-medium">{formatUGX(walletCharge)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange rate</span>
                <span className="font-medium">1 credit = {formatUGX(Math.max(1, Math.round(ugxPerCredit)))}</span>
              </div>
              {insufficientWalletForCredits ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Top up your artist wallet first to cover this credit purchase.
                </div>
              ) : null}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              !selectedAmount ||
              selectedAmount < minAmount ||
              isProcessing ||
              (topupMode === 'ugx' && !phoneNumber) ||
              insufficientWalletForCredits
            }
            className={cn(
              'w-full py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2',
              selectedAmount >= minAmount && !isProcessing && !(topupMode === 'ugx' && !phoneNumber) && !insufficientWalletForCredits
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : topupMode === 'ugx' ? (
              <>
                Top Up Wallet
                <ArrowRight className="h-5 w-5" />
              </>
            ) : (
              <>
                <Coins className="h-5 w-5" />
                Buy Credits
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Wallet Strategy
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>1. Use ZengaPay to add UGX to your wallet.</p>
              <p>2. Move wallet balance into credits when you need platform-native spending.</p>
              <p>3. Keep SACCO deposits, share purchases, and credit exchanges wallet-funded for cleaner tracking.</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Why This Flow
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>ZengaPay remains the only external payment rail.</p>
              <p>Everything else happens inside your Tesotunes wallet, which keeps balances and credit conversions consistent.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
