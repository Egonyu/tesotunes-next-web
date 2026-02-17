'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Smartphone,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeposit, usePaymentStatus, formatPhoneNumber } from '@/hooks/usePayments';
import { toast } from 'sonner';

export default function ArtistTopUpPage() {
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

  const presetAmounts = [10000, 25000, 50000, 100000, 200000, 500000];

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    const numValue = parseInt(value.replace(/\D/g, ''));
    setCustomAmount(value);
    setAmount(numValue || null);
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
      toast.success('Payment successful! Your wallet has been topped up.');
    } else if (paymentStatus?.status === 'failed') {
      setPaymentStep('failed');
      toast.error('Payment failed. Please try again.');
    }
  }, [paymentStatus]);

  const handleSubmit = async () => {
    if (!amount || amount < 1000) {
      toast.error('Minimum top-up amount is UGX 1,000');
      return;
    }

    if (!validatePhone()) return;

    setPaymentStep('processing');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const result = await depositMutation.mutateAsync({
        amount,
        phone: formattedPhone,
        provider: 'zengapay',
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
          <h2 className="text-2xl font-bold">Payment Successful!</h2>
          <p className="text-muted-foreground">
            UGX {selectedAmount.toLocaleString()} has been added to your wallet
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
            <p className="text-xl font-bold">UGX {selectedAmount.toLocaleString()}</p>
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
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/artist/wallet"
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Top Up Wallet</h1>
          <p className="text-sm text-muted-foreground">Add funds to purchase credits</p>
        </div>
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
                amount === preset && !customAmount
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-muted'
              )}
            >
              UGX {preset.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            UGX
          </span>
          <input
            type="text"
            value={customAmount}
            onChange={(e) => handleCustomAmount(e.target.value)}
            placeholder="Enter custom amount"
            className="w-full pl-14 pr-4 py-3 rounded-lg border bg-background"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Minimum: UGX 1,000 • Maximum: UGX 5,000,000
        </p>
      </div>

      {/* Payment Method */}
      <div className="p-6 rounded-xl border bg-card">
        <h2 className="font-semibold mb-4">Payment Method</h2>
        <div className="flex items-center gap-3 p-4 rounded-lg border border-primary bg-primary/5">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-green-600">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="text-left flex-1">
            <p className="font-medium">ZengaPay Mobile Money</p>
            <p className="text-sm text-muted-foreground">Pay via MTN MoMo or Airtel Money</p>
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

      {/* Summary */}
      {selectedAmount > 0 && (
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span>UGX {selectedAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>UGX {selectedAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!amount || amount < 1000 || !phoneNumber || depositMutation.isPending}
        className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {depositMutation.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Smartphone className="h-5 w-5" />
            Pay with Mobile Money
          </>
        )}
      </button>

      {/* Security Note */}
      <p className="text-xs text-center text-muted-foreground">
        Your payment is secured with industry-standard encryption.
        Funds will be available immediately after successful payment.
      </p>
    </div>
  );
}
