'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { toast } from 'sonner';
import { 
  ChevronLeft, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  X,
  Loader2,
  Phone,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSaccoLoan,
  useMakeLoanPayment,
  type SaccoLoan,
} from '@/hooks/useSacco';

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const loanId = parseInt(resolvedParams.id);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');

  const { data: loan, isLoading, error } = useSaccoLoan(loanId);
  const paymentMutation = useMakeLoanPayment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="container max-w-4xl py-8">
        <Link href="/sacco/loans" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to Loans
        </Link>
        <div className="p-12 rounded-xl border bg-card text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="text-xl font-semibold mb-2">Loan not found</h2>
          <p className="text-muted-foreground">This loan may not exist or you don&apos;t have access.</p>
        </div>
      </div>
    );
  }

  const payments = loan.payments || [];
  const paidPayments = payments.length;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const progressPercent = loan.amount > 0 ? ((loan.amount - loan.balance) / loan.amount) * 100 : 0;

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
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{loan.product}</h2>
            <p className="text-muted-foreground">
              Loan #{loan.id} • {loan.disbursed_at ? `Started ${new Date(loan.disbursed_at).toLocaleDateString()}` : 'Pending'}
            </p>
          </div>
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-medium capitalize',
            loan.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            loan.status === 'paid_off' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            loan.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''
          )}>
            {loan.status === 'paid_off' ? 'Paid Off' : loan.status}
          </span>
        </div>
      </div>

      {/* Loan Summary Card */}
      <div className="p-6 rounded-xl bg-linear-to-br from-purple-600 to-indigo-600 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-purple-100 text-sm">Original Amount</p>
            <p className="text-2xl font-bold mt-1">UGX {loan.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-purple-100 text-sm">Outstanding Balance</p>
            <p className="text-2xl font-bold mt-1">UGX {loan.balance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-purple-100 text-sm">Total Paid</p>
            <p className="text-2xl font-bold mt-1">UGX {totalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-purple-100 text-sm">Monthly Payment</p>
            <p className="text-2xl font-bold mt-1">UGX {loan.monthly_payment.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-purple-100">Repayment Progress</span>
            <span className="font-medium">{paidPayments} payments made</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-purple-100 text-sm mt-2">
            {Math.round(progressPercent)}% repaid
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loan Details */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Loan Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-lg font-semibold">{loan.interest_rate}% per annum</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Term</p>
                <p className="text-lg font-semibold">{loan.term_months} months</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Disbursement Date</p>
                <p className="text-lg font-semibold">{loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString() : 'Pending'}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="text-lg font-semibold">{loan.due_date ? new Date(loan.due_date).toLocaleDateString() : '—'}</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Next Payment</p>
              <p className="font-medium mt-1">UGX {loan.next_payment.toLocaleString()} due {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'TBD'}</p>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Payment Schedule</h3>
              <button className="flex items-center gap-2 text-sm text-primary">
                <Download className="h-4 w-4" />
                Download Schedule
              </button>
            </div>
            <div className="divide-y max-h-96 overflow-auto">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No payments recorded yet</div>
              ) : payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Payment #{payment.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                        {payment.principal > 0 && ` • Principal: UGX ${payment.principal.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">UGX {payment.amount.toLocaleString()}</p>
                    {payment.interest > 0 && (
                      <p className="text-xs text-muted-foreground">Interest: UGX {payment.interest.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next Payment */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Next Payment</h3>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <p className="font-medium text-orange-900 dark:text-orange-100">Due Soon</p>
              </div>
              <p className="text-2xl font-bold">UGX {loan.next_payment.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Due on {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'TBD'}
              </p>
            </div>
            <button
              onClick={() => {
                setPaymentAmount(loan.monthly_payment.toString());
                setShowPaymentModal(true);
              }}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
            >
              Make Payment
            </button>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span>View Loan Agreement</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted">
                <Download className="h-5 w-5 text-muted-foreground" />
                <span>Download Statement</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span>Set Up Auto-Pay</span>
              </button>
            </div>
          </div>

          {/* Help */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Need help?</strong> Contact SACCO support for loan restructuring 
              or payment extension requests.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Make Loan Payment</h3>
              <button 
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount('');
                }}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Balance Info */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding Balance</span>
                  <span className="font-bold">UGX {loan.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-muted-foreground">Monthly Payment Due</span>
                  <span className="font-medium">UGX {loan.monthly_payment.toLocaleString()}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">UGX</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    max={loan.balance}
                    className="w-full pl-14 pr-4 py-3 border rounded-lg bg-background text-lg"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0771234567"
                    className="w-full pl-12 pr-4 py-3 border rounded-lg bg-background"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn_momo')}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                      paymentMethod === 'mtn_momo'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                        : 'hover:border-foreground/30'
                    )}
                  >
                    <Smartphone className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium">MTN MoMo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('airtel_money')}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                      paymentMethod === 'airtel_money'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                        : 'hover:border-foreground/30'
                    )}
                  >
                    <Smartphone className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium">Airtel Money</span>
                  </button>
                </div>
              </div>

              {/* Quick Amounts */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentAmount(loan.monthly_payment.toString())}
                  className={cn(
                    'py-2 text-sm rounded-lg border transition-colors',
                    paymentAmount === loan.monthly_payment.toString()
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'hover:border-foreground'
                  )}
                >
                  1 Month
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount((loan.monthly_payment * 2).toString())}
                  className={cn(
                    'py-2 text-sm rounded-lg border transition-colors',
                    paymentAmount === (loan.monthly_payment * 2).toString()
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'hover:border-foreground'
                  )}
                >
                  2 Months
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(loan.balance.toString())}
                  className={cn(
                    'py-2 text-sm rounded-lg border transition-colors',
                    paymentAmount === loan.balance.toString()
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'hover:border-foreground'
                  )}
                >
                  Full Balance
                </button>
              </div>

              {/* Submit */}
              <button
                disabled={
                  !paymentAmount || 
                  parseInt(paymentAmount) < 10000 || 
                  parseInt(paymentAmount) > loan.balance ||
                  !phoneNumber ||
                  paymentMutation.isPending
                }
                onClick={() => {
                  paymentMutation.mutate(
                    {
                      loan_id: loanId,
                      amount: parseInt(paymentAmount),
                      phone_number: phoneNumber,
                      payment_method: paymentMethod,
                    },
                    {
                      onSuccess: () => {
                        toast.success('Payment submitted successfully');
                        setShowPaymentModal(false);
                        setPaymentAmount('');
                        setPhoneNumber('');
                      },
                      onError: (err: Error) => {
                        toast.error(err.message || 'Payment failed');
                      },
                    }
                  );
                }}
                className={cn(
                  'w-full py-3 rounded-lg font-medium transition-colors',
                  !paymentAmount || 
                  parseInt(paymentAmount) < 10000 || 
                  parseInt(paymentAmount) > loan.balance ||
                  !phoneNumber ||
                  paymentMutation.isPending
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                )}
              >
                {paymentMutation.isPending ? (
                  <>
                    <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : `Pay UGX ${parseInt(paymentAmount || '0').toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
