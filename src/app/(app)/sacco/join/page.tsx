'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Check,
  Users,
  PiggyBank,
  Shield,
  Loader2,
  Phone,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJoinSacco } from '@/hooks/useSacco';

interface JoinFormData {
  initial_deposit: number;
  initial_shares: number;
  phone_number: string;
  accept_terms: boolean;
  payment_method: 'mtn_momo' | 'airtel_money';
}

export default function SaccoJoinPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<JoinFormData>({
    initial_deposit: 50000,
    initial_shares: 5,
    phone_number: '',
    accept_terms: false,
    payment_method: 'mtn_momo',
  });

  const sharePrice = 10000;
  const minimumSavings = 50000;
  const totalAmount = formData.initial_deposit + (formData.initial_shares * sharePrice);

  const joinMutation = useJoinSacco();

  const handleSubmit = () => {
    if (formData.accept_terms && formData.phone_number) {
      joinMutation.mutate(
        {
          initial_deposit: formData.initial_deposit,
          initial_shares: formData.initial_shares,
          phone_number: formData.phone_number,
          payment_method: formData.payment_method,
        },
        {
          onSuccess: () => {
            setStep(3);
            toast.success('Welcome to TesoTunes SACCO!');
          },
          onError: (err: Error) => {
            toast.error(err.message || 'Failed to join SACCO');
          },
        }
      );
    }
  };

  const membershipBenefits = [
    'Save and earn 12% interest annually',
    'Access loans up to 3x your savings',
    'Earn dividends on your shares',
    'Participate in member voting',
    'Access to emergency funds',
    'Financial literacy workshops',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/sacco"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to SACCO
        </Link>
        <h1 className="text-2xl font-bold">Join TesoTunes SACCO</h1>
        <p className="text-muted-foreground">
          Become a member and start building your financial future
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center font-medium',
                step >= s
                  ? 'bg-emerald-600 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
            <span
              className={cn(
                'ml-2 hidden sm:inline',
                step >= s ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {s === 1 ? 'Details' : s === 2 ? 'Review' : 'Complete'}
            </span>
            {s < 3 && (
              <div
                className={cn(
                  'w-16 sm:w-24 h-1 mx-2 rounded',
                  step > s ? 'bg-emerald-600' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Membership Details */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Benefits Card */}
          <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-emerald-600" />
              Membership Benefits
            </h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {membershipBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Initial Savings */}
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <PiggyBank className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold">Initial Savings Deposit</h3>
                <p className="text-sm text-muted-foreground">
                  Minimum UGX {minimumSavings.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">UGX</span>
              <input
                type="number"
                value={formData.initial_deposit}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  initial_deposit: Math.max(minimumSavings, parseInt(e.target.value) || 0)
                })}
                min={minimumSavings}
                step={10000}
                className="w-full pl-14 pr-4 py-3 border rounded-lg bg-background text-lg"
              />
            </div>
            <div className="flex gap-2">
              {[50000, 100000, 250000, 500000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData({ ...formData, initial_deposit: amount })}
                  className={cn(
                    'flex-1 py-2 text-sm rounded-lg border transition-colors',
                    formData.initial_deposit === amount
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'hover:border-foreground'
                  )}
                >
                  {(amount / 1000)}K
                </button>
              ))}
            </div>
          </div>

          {/* Initial Shares */}
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Shares to Purchase</h3>
                  <p className="text-sm text-muted-foreground">
                    UGX {sharePrice.toLocaleString()} per share (min 5)
                  </p>
                </div>
              </div>
              <p className="font-bold text-lg">
                UGX {(formData.initial_shares * sharePrice).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, initial_shares: Math.max(5, formData.initial_shares - 5) })}
                className="h-12 w-12 rounded-lg border text-lg font-medium hover:bg-muted"
              >
                −
              </button>
              <input
                type="number"
                value={formData.initial_shares}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  initial_shares: Math.max(5, parseInt(e.target.value) || 5)
                })}
                min={5}
                className="flex-1 text-center py-3 border rounded-lg bg-background text-xl font-semibold"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, initial_shares: formData.initial_shares + 5 })}
                className="h-12 w-12 rounded-lg border text-lg font-medium hover:bg-muted"
              >
                +
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <h3 className="font-semibold">Payment Method</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: 'mtn_momo' })}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border text-left transition-all',
                  formData.payment_method === 'mtn_momo'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'hover:border-foreground'
                )}
              >
                <Smartphone className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">MTN MoMo</p>
                  <p className="text-sm text-muted-foreground">Pay via MTN Mobile Money</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: 'airtel_money' })}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border text-left transition-all',
                  formData.payment_method === 'airtel_money'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'hover:border-foreground'
                )}
              >
                <Smartphone className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Airtel Money</p>
                  <p className="text-sm text-muted-foreground">Pay via Airtel Money</p>
                </div>
              </button>
            </div>
          </div>

          {/* Phone Number */}
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <h3 className="font-semibold">Phone Number</h3>
            <p className="text-sm text-muted-foreground">
              Enter the phone number for payment
            </p>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="0771234567"
                className="w-full pl-12 pr-4 py-3 border rounded-lg bg-background"
              />
            </div>
          </div>

          {/* Total & Continue */}
          <div className="p-6 rounded-xl bg-muted/50 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">UGX {totalAmount.toLocaleString()}</p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review & Terms */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="p-6 rounded-xl border bg-card">
            <h3 className="font-semibold mb-4">Membership Summary</h3>
            <div className="space-y-3 divide-y">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Initial Savings</span>
                <span className="font-medium">UGX {formData.initial_deposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Shares ({formData.initial_shares} × UGX {sharePrice.toLocaleString()})</span>
                <span className="font-medium">UGX {(formData.initial_shares * sharePrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Total</span>
                <span>UGX {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-6 rounded-xl border bg-card">
            <h3 className="font-semibold mb-4">Terms & Conditions</h3>
            <div className="h-48 overflow-y-auto p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground mb-4">
              <p className="mb-3">By joining TesoTunes Artist SACCO, you agree to the following:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Minimum savings balance of UGX 50,000 must be maintained at all times.</li>
                <li>Shares cannot be sold or transferred for the first 12 months.</li>
                <li>Loans are subject to approval and require a minimum of 3 months membership.</li>
                <li>Dividends are paid annually based on share holdings and SACCO performance.</li>
                <li>Members must maintain active status on the TesoTunes platform.</li>
                <li>Withdrawal of savings requires 7 days notice for amounts over UGX 500,000.</li>
                <li>Members agree to abide by all SACCO by-laws and regulations.</li>
                <li>Personal information will be used for SACCO administration purposes only.</li>
              </ol>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.accept_terms}
                onChange={(e) => setFormData({ ...formData, accept_terms: e.target.checked })}
                className="mt-1 h-5 w-5 rounded border-muted-foreground"
              />
              <span className="text-sm">
                I have read and agree to the SACCO Terms & Conditions, By-Laws, and Privacy Policy.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.accept_terms || !formData.phone_number || joinMutation.isPending}
              className={cn(
                'flex-1 py-3 rounded-lg font-medium transition-colors',
                formData.accept_terms && formData.phone_number && !joinMutation.isPending
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {joinMutation.isPending ? (
                <>
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Pay UGX ${totalAmount.toLocaleString()}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center py-12">
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to TesoTunes SACCO!</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Your membership has been activated. You can now access savings, purchase shares, 
            and apply for loans after 3 months.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sacco"
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/sacco/savings"
              className="px-6 py-3 border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Make a Deposit
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
