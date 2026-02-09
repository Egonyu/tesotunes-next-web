'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ChevronLeft, 
  Calculator,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSaccoLoanProducts,
  useSaccoMembership,
  useApplyForLoan,
  type SaccoLoanProduct,
} from '@/hooks/useSacco';

export default function LoanApplyPage() {
  const router = useRouter();
  const { data: products, isLoading: loadingProducts } = useSaccoLoanProducts();
  const { data: membership } = useSaccoMembership();
  const applyMutation = useApplyForLoan();

  const loanProducts: SaccoLoanProduct[] = products || [];
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [amount, setAmount] = useState<number>(1000000);
  const [term, setTerm] = useState<number>(12);
  const [purpose, setPurpose] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');

  const userSavings = membership?.savings_balance ?? 0;
  const maxEligible = userSavings * 3;

  // Auto-select first product if none selected
  const selectedLoan = loanProducts.find(p => p.id === selectedProductId) || loanProducts[0];
  const effectiveMaxAmount = selectedLoan ? Math.min(selectedLoan.max_amount, maxEligible || selectedLoan.max_amount) : 10000000;
  const maxTerm = selectedLoan ? Math.max(...selectedLoan.term_months) : 24;
  
  // Calculate monthly payment
  const interestRate = selectedLoan?.interest_rate || 12;
  const monthlyInterestRate = interestRate / 100 / 12;
  const monthlyPayment = amount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term)) 
    / (Math.pow(1 + monthlyInterestRate, term) - 1);
  const totalPayment = monthlyPayment * term;
  const totalInterest = totalPayment - amount;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !phoneNumber) return;
    applyMutation.mutate({
      product_id: selectedLoan.id,
      amount,
      term_months: term,
      purpose,
      phone_number: phoneNumber,
      payment_method: paymentMethod,
    }, {
      onSuccess: () => {
        toast.success('Loan application submitted!');
        router.push('/sacco/loans?applied=true');
      },
      onError: (err: Error) => toast.error(err.message || 'Failed to submit application'),
    });
  };

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link 
          href="/sacco/loans"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Loans
        </Link>
        <h2 className="text-2xl font-bold">Apply for a Loan</h2>
        <p className="text-muted-foreground">
          Choose a loan product and complete your application
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Loan Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Loan Type Selection */}
            <div className="space-y-4">
              <label className="text-lg font-semibold">1. Select Loan Type</label>
              <div className="grid gap-3">
                {loanProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setAmount(Math.min(amount, Math.min(product.max_amount, maxEligible || product.max_amount)));
                      const pMaxTerm = Math.max(...product.term_months);
                      setTerm(Math.min(term, pMaxTerm));
                    }}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all',
                      selectedLoan?.id === product.id 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                        : 'hover:border-foreground'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{product.name}</p>
                          {selectedLoan?.id === product.id && (
                            <Check className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>Max: UGX {product.max_amount.toLocaleString()}</span>
                          <span>Interest: {product.interest_rate}%</span>
                          <span>Terms: {product.term_months.join('/')}&nbsp;months</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Loan Amount */}
            <div className="space-y-4">
              <label className="text-lg font-semibold">2. Loan Amount</label>
              <div>
                <input
                  type="range"
                  min={100000}
                  max={effectiveMaxAmount}
                  step={100000}
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>UGX 100,000</span>
                  <span>UGX {effectiveMaxAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="text-3xl font-bold">UGX {amount.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Repayment Term */}
            <div className="space-y-4">
              <label className="text-lg font-semibold">3. Repayment Term</label>
              <div className="grid grid-cols-4 gap-2">
                {(selectedLoan?.term_months || [3, 6, 12, 24]).map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setTerm(months)}
                    className={cn(
                      'py-3 rounded-lg border font-medium transition-colors',
                      term === months
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'hover:border-foreground'
                    )}
                  >
                    {months} months
                  </button>
                ))}
              </div>
            </div>
            
            {/* Purpose */}
            <div className="space-y-4">
              <label className="text-lg font-semibold">4. Loan Purpose</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={4}
                required
                placeholder="Briefly describe what you'll use this loan for..."
                className="w-full px-4 py-3 rounded-lg border bg-background resize-none"
              />
            </div>
            
            {/* Phone Number */}
            <div className="space-y-4">
              <label className="text-lg font-semibold">5. Payment Details</label>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0771234567"
                    required
                    className="w-full px-4 py-3 rounded-lg border bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mtn_momo')}
                      className={cn(
                        'py-2 rounded-lg border text-sm font-medium transition-colors',
                        paymentMethod === 'mtn_momo'
                          ? 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'hover:border-foreground'
                      )}
                    >
                      MTN MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('airtel_money')}
                      className={cn(
                        'py-2 rounded-lg border text-sm font-medium transition-colors',
                        paymentMethod === 'airtel_money'
                          ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'hover:border-foreground'
                      )}
                    >
                      Airtel Money
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {selectedLoan && (
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">Requirements for {selectedLoan.name}</p>
                  <ul className="mt-2 space-y-1">
                    {selectedLoan.requirements.map((req: string, i: number) => (
                      <li key={i} className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            )}
          </div>
          
          {/* Loan Calculator Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold">Loan Calculator</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Loan Amount</span>
                    <span className="font-medium">UGX {amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-medium">{interestRate}% per annum</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Repayment Term</span>
                    <span className="font-medium">{term} months</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Monthly Payment</span>
                    <span className="font-semibold text-lg">UGX {Math.round(monthlyPayment).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Total Interest</span>
                    <span className="font-medium text-orange-600">UGX {Math.round(totalInterest).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Total Repayment</span>
                    <span className="font-bold text-xl">UGX {Math.round(totalPayment).toLocaleString()}</span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={applyMutation.isPending || !purpose || !phoneNumber || !selectedLoan}
                  className={cn(
                    'w-full mt-6 py-3 rounded-lg font-medium transition-colors',
                    applyMutation.isPending || !purpose || !phoneNumber
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  )}
                >
                  {applyMutation.isPending ? (
                    <>
                      <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                      Submitting Application...
                    </>
                  ) : 'Submit Application'}
                </button>
                
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Your application will be reviewed within 2-3 business days.
                </p>
              </div>
              
              {/* Eligibility */}
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30">
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  <strong>Your eligibility:</strong> With UGX {userSavings.toLocaleString()} in savings, 
                  you can borrow up to UGX {maxEligible.toLocaleString()}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
