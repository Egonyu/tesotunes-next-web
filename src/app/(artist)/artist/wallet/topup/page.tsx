'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Smartphone,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  Coins,
  Wallet,
  Shield,
  Zap,
  TrendingUp,
  Gift,
  ArrowRight,
  Music,
  Star,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeposit, usePaymentStatus, formatPhoneNumber, detectProvider } from '@/hooks/usePayments';
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

  const { data: paymentStatus } = usePaymentStatus(transactionRef || '', {
    enabled: !!transactionRef && paymentStep === 'processing',
    refetchInterval: transactionRef && paymentStep === 'processing' ? 3000 : undefined,
  });

  const ugxPresets = [10000, 25000, 50000, 100000, 200000, 500000];
  const creditsPresets = [100, 500, 1000, 2500, 5000, 10000];
  const presetAmounts = topupMode === 'ugx' ? ugxPresets : creditsPresets;
  const currencyLabel = topupMode === 'ugx' ? 'UGX' : 'Credits';
  const minAmount = topupMode === 'ugx' ? 1000 : 10;
  const maxAmount = topupMode === 'ugx' ? 5000000 : 100000;

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount(value.toLocaleString());
  };

  const handleCustomAmount = (value: string) => {
    const numValue = parseInt(value.replace(/\D/g, ''));
    setCustomAmount(value);
    setAmount(numValue || null);
  };

  const handleModeSwitch = (mode: TopupMode) => {
    setTopupMode(mode);
    setAmount(null);
    setCustomAmount('');
  };

  const validatePhone = () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 9) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (paymentStatus?.status === 'completed') {
      setPaymentStep('success');
      toast.success(
        topupMode === 'ugx'
          ? 'Payment successful! Your wallet has been topped up.'
          : 'Credits purchased successfully!'
      );
    } else if (paymentStatus?.status === 'failed') {
      setPaymentStep('failed');
      toast.error('Payment failed. Please try again.');
    }
  }, [paymentStatus, topupMode]);

  const handleSubmit = async () => {
    if (!amount || amount < minAmount) {
      toast.error(`Minimum top-up amount is ${currencyLabel} ${minAmount.toLocaleString()}`);
      return;
    }

    if (topupMode === 'ugx') {
      if (!validatePhone()) return;

      setPaymentStep('processing');

      try {
        const formattedPhone = formatPhoneNumber(phoneNumber);
        const detectedProvider = detectProvider(phoneNumber);

        if (detectedProvider === 'unknown') {
          toast.error('Could not detect mobile money provider. Please use an MTN or Airtel number.');
          setPaymentStep('input');
          return;
        }

        const result = await depositMutation.mutateAsync({
          amount,
          phone: formattedPhone,
          provider: detectedProvider,
        });

        if (result.transaction_ref) {
          setTransactionRef(result.transaction_ref);
          toast.info('Please check your phone to confirm the payment');
        } else {
          setPaymentStep('success');
          toast.success('Payment initiated successfully!');
        }
      } catch (error: unknown) {
        setPaymentStep('failed');
        const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
        toast.error(errorMessage);
      }
    } else {
      // Credits purchase - use wallet balance
      setPaymentStep('processing');
      try {
        // Credits purchase would call /api/credits/purchase
        // For now, show a message that this will be available soon
        toast.info('Credits purchase will be available soon. Please top up your UGX wallet first.');
        setPaymentStep('input');
      } catch (error: unknown) {
        setPaymentStep('failed');
        const errorMessage = error instanceof Error ? error.message : 'Failed to purchase credits';
        toast.error(errorMessage);
      }
    }
  };

  const handleRetry = () => {
    setPaymentStep('input');
    setTransactionRef(null);
  };

  const selectedAmount = amount || 0;

  // Success Screen
  if (paymentStep === 'success') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">
            {topupMode === 'ugx' ? 'Payment Successful!' : 'Credits Purchased!'}
          </h2>
          <p className="text-muted-foreground">
            {topupMode === 'ugx'
              ? `UGX ${selectedAmount.toLocaleString()} has been added to your wallet`
              : `${selectedAmount.toLocaleString()} credits have been added to your account`}
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link
              href="/artist/wallet"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Go to Wallet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Failed Screen
  if (paymentStep === 'failed') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="text-center space-y-4">
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

  // Processing Screen
  if (paymentStep === 'processing' && transactionRef) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold">Awaiting Payment</h2>
          <p className="text-muted-foreground">
            Please check your phone and enter your PIN to confirm the payment
          </p>
          <div className="p-4 bg-muted rounded-lg max-w-xs mx-auto">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-xl font-bold">{currencyLabel} {selectedAmount.toLocaleString()}</p>
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/artist/wallet"
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Top Up</h1>
          <p className="text-sm text-muted-foreground">Add funds or purchase credits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column — Form (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Mode Toggle */}
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

          {/* Mode Description */}
          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            {topupMode === 'ugx' ? (
              <p>Top up your UGX wallet via Mobile Money. Use your wallet balance for purchases, subscriptions, and withdrawals.</p>
            ) : (
              <p>Purchase platform credits to use for song purchases, tips, voting, and promotions. Credits are bought using your UGX wallet balance.</p>
            )}
          </div>

          {/* Selected Amount Display */}
          <div className="p-6 rounded-xl border bg-card text-center">
            <p className="text-sm text-muted-foreground mb-1">Amount</p>
            <p className="text-3xl font-bold">
              {currencyLabel} {selectedAmount > 0 ? selectedAmount.toLocaleString() : '0'}
            </p>
          </div>

          {/* Amount Selection */}
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
                  {topupMode === 'ugx' ? `UGX ${preset.toLocaleString()}` : `${preset.toLocaleString()}`}
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
                onChange={(e) => handleCustomAmount(e.target.value)}
                placeholder="Enter custom amount"
                className="w-full pl-16 pr-4 py-3 rounded-lg border bg-background"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Minimum: {currencyLabel} {minAmount.toLocaleString()} &bull; Maximum: {currencyLabel} {maxAmount.toLocaleString()}
            </p>
          </div>

          {/* Payment Method - only for UGX mode */}
          {topupMode === 'ugx' && (
            <>
              <div className="p-6 rounded-xl border bg-card">
                <h2 className="font-semibold mb-4">Payment Method</h2>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-primary bg-primary/5">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-green-600">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">Mobile Money</p>
                    <p className="text-sm text-muted-foreground">MTN MoMo or Airtel Money</p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="p-6 rounded-xl border bg-card">
                <h2 className="font-semibold mb-4">Phone Number</h2>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., 0772123456"
                  className="w-full px-4 py-3 rounded-lg border bg-background"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter your MTN or Airtel number. You will receive a prompt to confirm payment.
                </p>
              </div>
            </>
          )}

          {/* Credits Payment Note */}
          {topupMode === 'credits' && (
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="font-semibold mb-4">Payment Source</h2>
              <div className="flex items-center gap-3 p-4 rounded-lg border border-primary bg-primary/5">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-amber-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">UGX Wallet Balance</p>
                  <p className="text-sm text-muted-foreground">Credits are purchased from your wallet</p>
                </div>
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedAmount > 0 && (
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="font-semibold mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {topupMode === 'ugx' ? 'Top Up Amount' : 'Credits'}
                  </span>
                  <span>{currencyLabel} {selectedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{currencyLabel} {selectedAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={
              !amount ||
              amount < minAmount ||
              (topupMode === 'ugx' && !phoneNumber) ||
              depositMutation.isPending
            }
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {depositMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : topupMode === 'ugx' ? (
              <>
                <Smartphone className="h-5 w-5" />
                Pay with Mobile Money
              </>
            ) : (
              <>
                <Coins className="h-5 w-5" />
                Purchase Credits
              </>
            )}
          </button>

          {/* Security Note */}
          <p className="text-xs text-center text-muted-foreground pb-4">
            Your payment is secured with industry-standard encryption.
            {topupMode === 'ugx'
              ? ' Funds will be available immediately after successful payment.'
              : ' Credits will be added to your account instantly.'}
          </p>
        </div>

        {/* Right Column — Info Cards (2/5) */}
        <div className="lg:col-span-2 space-y-5">
          {/* How It Works */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              How It Works
            </h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Choose amount', desc: 'Select a preset or enter a custom amount' },
                { step: '2', title: 'Enter phone number', desc: 'Use your MTN MoMo or Airtel Money number' },
                { step: '3', title: 'Confirm on phone', desc: 'Approve the payment prompt on your device' },
                { step: '4', title: 'Funds credited', desc: 'Wallet is topped up instantly on success' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What You Can Do */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" />
              {topupMode === 'ugx' ? 'Use Your Wallet For' : 'Use Credits For'}
            </h3>
            {topupMode === 'ugx' ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Music, label: 'Buy Songs', color: 'text-pink-500 bg-pink-500/10' },
                  { icon: Star, label: 'Go Premium', color: 'text-yellow-500 bg-yellow-500/10' },
                  { icon: Coins, label: 'Buy Credits', color: 'text-amber-500 bg-amber-500/10' },
                  { icon: TrendingUp, label: 'Withdraw Earnings', color: 'text-green-500 bg-green-500/10' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/40"
                  >
                    <div className={cn('p-1.5 rounded-md', item.color)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Music, label: 'Purchase Songs', color: 'text-pink-500 bg-pink-500/10' },
                  { icon: Gift, label: 'Tip Artists', color: 'text-amber-500 bg-amber-500/10' },
                  { icon: Star, label: 'Vote in Awards', color: 'text-yellow-500 bg-yellow-500/10' },
                  { icon: TrendingUp, label: 'Promote Music', color: 'text-green-500 bg-green-500/10' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/40"
                  >
                    <div className={cn('p-1.5 rounded-md', item.color)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supported Providers */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-500" />
              Supported Providers
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <span className="text-black font-bold text-xs">MTN</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">MTN Mobile Money</p>
                  <p className="text-xs text-muted-foreground">Dial *165# to check balance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">Airtel</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Airtel Money</p>
                  <p className="text-xs text-muted-foreground">Dial *185# to check balance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Trust */}
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-6">
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Safe & Secure
            </h3>
            <div className="space-y-3">
              {[
                { icon: Shield, text: 'End-to-end encrypted payments' },
                { icon: Clock, text: 'Instant wallet top-up on success' },
                { icon: CheckCircle, text: 'No hidden fees or charges' },
                { icon: HelpCircle, text: 'Support available 24/7' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-base mb-4">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: 'View Wallet', href: '/artist/wallet', icon: Wallet },
                { label: 'Transaction History', href: '/artist/wallet', icon: Clock },
                { label: 'Earnings Dashboard', href: '/artist/earnings', icon: TrendingUp },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
