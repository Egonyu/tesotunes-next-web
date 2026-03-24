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

export default function TopUpPage() {
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

  const ugxPresets = [5000, 10000, 20000, 50000, 100000, 200000];
  const creditsPresets = [100, 500, 1000, 2500, 5000, 10000];
  const presetAmounts = topupMode === 'ugx' ? ugxPresets : creditsPresets;
  const currencyLabel = topupMode === 'ugx' ? 'UGX' : 'Credits';
  const minAmount = topupMode === 'ugx' ? 1000 : 10;
  const maxAmount = topupMode === 'ugx' ? 5000000 : 100000;
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
      return {
        title: 'ZengaPay wallet top-up',
        description: 'Top up your wallet through ZengaPay with your preferred phone number.',
      };
    }

    return {
      title: 'Wallet to credits exchange',
      description: 'Buy credits instantly from your wallet balance, then spend them on songs, tips, voting, and promotions.',
    };
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
      toast.error('Top up your wallet first to buy this amount of credits.');
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
      <div className="container py-6 max-w-lg mx-auto">
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">
            {topupMode === 'ugx' ? 'Wallet Topped Up' : 'Credits Purchased'}
          </h2>
          <p className="text-muted-foreground">
            {topupMode === 'ugx'
              ? `${formatUGX(selectedAmount)} has been added to your wallet.`
              : `${selectedAmount.toLocaleString()} credits are now available in your account.`}
          </p>
          {topupMode === 'credits' ? (
            <p className="text-sm text-muted-foreground">
              Wallet debited: {formatUGX(walletCharge)}
            </p>
          ) : null}
          <div className="flex gap-3 justify-center pt-4">
            <Link
              href="/wallet"
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
      <div className="container py-6 max-w-lg mx-auto">
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">Payment Failed</h2>
          <p className="text-muted-foreground">
            Something went wrong. Please try again.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Try Again
            </button>
            <Link
              href="/wallet"
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
      <div className="container py-6 max-w-lg mx-auto">
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold">Awaiting ZengaPay Confirmation</h2>
          <p className="text-muted-foreground">
            Check your phone and enter your PIN to confirm the mobile money payment.
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
    <div className="container py-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/wallet"
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Top Up</h1>
          <p className="text-sm text-muted-foreground">Fund your wallet or convert wallet balance into credits</p>
        </div>
      </div>

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
            topupMode === 'ugx'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground'
          )}
        >
          <Wallet className="h-5 w-5" />
          <span>UGX Wallet</span>
        </button>
        <button
          onClick={() => handleModeSwitch('credits')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors',
            topupMode === 'credits'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground'
          )}
        >
          <Coins className="h-5 w-5" />
          <span>Credits</span>
        </button>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">{modeSummary.title}</p>
        <p>{modeSummary.description}</p>
      </div>

      <div className="p-6 rounded-xl border bg-card text-center">
        <p className="text-sm text-muted-foreground mb-1">Amount</p>
        <p className="text-3xl font-bold">
          {topupMode === 'ugx'
            ? formatUGX(selectedAmount)
            : `${selectedAmount.toLocaleString()} credits`}
        </p>
        {topupMode === 'credits' && selectedAmount > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Wallet debit: {formatUGX(walletCharge)}
          </p>
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
                amount === preset
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-muted'
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
        <p className="text-xs text-muted-foreground mt-2">
          Minimum: {currencyLabel} {minAmount.toLocaleString()} • Maximum: {currencyLabel} {maxAmount.toLocaleString()}
        </p>
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
                <p className="text-sm text-muted-foreground">Single payment gateway for wallet top-ups</p>
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
            <p className="text-xs text-muted-foreground mt-2">
              Enter the phone number where ZengaPay should send the payment prompt.
            </p>
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
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Available wallet balance</span>
            <span className="font-medium">{formatUGX(walletBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Exchange rate</span>
            <span className="font-medium">
              1 credit = {formatUGX(Math.max(1, Math.round(ugxPerCredit)))}
            </span>
          </div>
          {insufficientWalletForCredits ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Your wallet balance is too low for this credit purchase. Top up your wallet first, then try again.
            </div>
          ) : null}
        </div>
      )}

      {selectedAmount > 0 ? (
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {topupMode === 'ugx' ? 'Wallet top-up' : 'Credits to receive'}
              </span>
              <span>
                {topupMode === 'ugx' ? formatUGX(selectedAmount) : `${selectedAmount.toLocaleString()} credits`}
              </span>
            </div>
            {topupMode === 'credits' ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet charge</span>
                <span>{formatUGX(walletCharge)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>
                {topupMode === 'ugx' ? formatUGX(selectedAmount) : formatUGX(walletCharge)}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
        <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Secure payment</p>
          <p className="text-muted-foreground">
            ZengaPay handles wallet top-ups. Credits are then exchanged internally from your wallet balance.
          </p>
        </div>
      </div>

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
          'w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-colors',
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
  );
}
