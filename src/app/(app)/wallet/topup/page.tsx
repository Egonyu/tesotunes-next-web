'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  Smartphone,
  CreditCard,
  Wallet,
  Check,
  ArrowRight,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeposit, usePaymentStatus, detectProvider, formatPhoneNumber } from '@/hooks/usePayments';
import { toast } from 'sonner';

type PaymentMethod = 'mtn' | 'airtel' | 'card';

export default function TopUpPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'input' | 'processing' | 'success' | 'failed'>('input');
  
  // Hook for initiating deposit
  const depositMutation = useDeposit();
  
  // Hook for polling payment status
  const { data: paymentStatus, refetch: refetchStatus } = usePaymentStatus(transactionRef || '', {
    enabled: !!transactionRef && paymentStep === 'processing',
    refetchInterval: transactionRef && paymentStep === 'processing' ? 3000 : undefined,
  });
  
  const presetAmounts = [5000, 10000, 20000, 50000, 100000, 200000];
  
  const paymentMethods = [
    { 
      id: 'mtn' as PaymentMethod, 
      name: 'MTN MoMo', 
      color: 'bg-yellow-500',
      description: 'Pay with MTN Mobile Money'
    },
    { 
      id: 'airtel' as PaymentMethod, 
      name: 'Airtel Money', 
      color: 'bg-red-500',
      description: 'Pay with Airtel Money'
    },
    { 
      id: 'card' as PaymentMethod, 
      name: 'Card', 
      color: 'bg-blue-500',
      description: 'Visa, Mastercard, etc.'
    },
  ];
  
  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };
  
  const handleCustomAmount = (value: string) => {
    const numValue = parseInt(value.replace(/\D/g, ''));
    setCustomAmount(value);
    setAmount(numValue || null);
  };
  
  // Validate phone number for mobile money
  const validatePhone = () => {
    if (paymentMethod === 'card') return true;
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 9) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    const detected = detectProvider(cleaned);
    // Map page payment method to detected provider format
    const expectedProvider = paymentMethod === 'mtn' ? 'mtn_momo' : paymentMethod === 'airtel' ? 'airtel_money' : null;
    if (detected !== expectedProvider && detected !== 'unknown') {
      toast.error(`This phone number appears to be ${detected === 'mtn_momo' ? 'MTN' : 'Airtel'}. Please use the correct payment method.`);
      return false;
    }
    return true;
  };
  
  // Handle payment status changes
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
      const formattedPhone = paymentMethod !== 'card' ? formatPhoneNumber(phoneNumber) : undefined;
      
      const result = await depositMutation.mutateAsync({
        amount,
        phone: formattedPhone,
        provider: paymentMethod,
      });
      
      if (result.transaction_ref) {
        setTransactionRef(result.transaction_ref);
        toast.info('Please check your phone to confirm the payment');
      } else {
        // For card payments or immediate success
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
  const isProcessing = paymentStep === 'processing' || depositMutation.isPending;

  // Success Screen
  if (paymentStep === 'success') {
    return (
      <div className="container py-6 max-w-lg mx-auto">
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Payment Successful!</h2>
          <p className="text-muted-foreground">
            UGX {selectedAmount.toLocaleString()} has been added to your wallet
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link
              href="/wallet"
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

  // Processing Screen
  if (paymentStep === 'processing' && transactionRef) {
    return (
      <div className="container py-6 max-w-lg mx-auto">
        <div className="text-center py-12 space-y-4">
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
    <div className="container py-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/wallet"
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Top Up Wallet</h1>
      </div>
      
      {/* Amount Selection */}
      <div className="p-6 rounded-xl border bg-card">
        <h2 className="font-semibold mb-4">Select Amount</h2>
        
        {/* Preset Amounts */}
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
        
        {/* Custom Amount */}
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
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-lg border transition-colors',
                paymentMethod === method.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center text-white', method.color)}>
                  {method.id === 'card' ? (
                    <CreditCard className="h-5 w-5" />
                  ) : (
                    <Smartphone className="h-5 w-5" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
              {paymentMethod === method.id && (
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Phone Number (for Mobile Money) */}
      {(paymentMethod === 'mtn' || paymentMethod === 'airtel') && (
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
            You will receive a prompt on this number to confirm payment
          </p>
        </div>
      )}
      
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
      
      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
        <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Secure Payment</p>
          <p className="text-muted-foreground">
            Your payment is protected with industry-standard encryption
          </p>
        </div>
      </div>
      
      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedAmount || selectedAmount < 1000 || isProcessing}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-colors',
          selectedAmount >= 1000 && !isProcessing
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        )}
      >
        {isProcessing ? (
          <>
            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Top Up UGX {selectedAmount.toLocaleString()}
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>
    </div>
  );
}
