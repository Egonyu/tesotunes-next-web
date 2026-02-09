'use client';

import Link from 'next/link';
import { 
  CreditCard, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  FileText,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSaccoLoans,
  useSaccoLoanProducts,
  useSaccoMembership,
  type SaccoLoan,
  type SaccoLoanProduct,
} from '@/hooks/useSacco';

export default function LoansPage() {
  const { data: loans, isLoading: loadingLoans, error: loansError } = useSaccoLoans();
  const { data: products, isLoading: loadingProducts } = useSaccoLoanProducts();
  const { data: membership } = useSaccoMembership();

  const loanProducts: SaccoLoanProduct[] = products || [];
  const allLoans: SaccoLoan[] = loans || [];
  
  const getStatusIcon = (status: SaccoLoan['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'paid_off':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
  };
  
  const getStatusStyles = (status: SaccoLoan['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'paid_off':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
      case 'rejected':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };
  
  const activeLoans = allLoans.filter(l => l.status === 'active');
  const totalBalance = activeLoans.reduce((sum, l) => sum + l.balance, 0);
  
  const isLoading = loadingLoans || loadingProducts;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (loansError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load loans</h2>
        <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Retry</button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Loans</h2>
          <p className="text-muted-foreground">
            Manage your loans and apply for new ones
          </p>
        </div>
        <Link 
          href="/sacco/loans/apply"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Apply for Loan
        </Link>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Active Loans</p>
          <p className="text-3xl font-bold">{activeLoans.length}</p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className="text-3xl font-bold">UGX {totalBalance.toLocaleString()}</p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Next Payment</p>
          <p className="text-3xl font-bold">
            {activeLoans[0]?.monthly_payment 
              ? `UGX ${activeLoans[0].monthly_payment.toLocaleString()}` 
              : '—'
            }
          </p>
          {activeLoans[0]?.due_date && (
            <p className="text-sm text-muted-foreground">
              Due: {new Date(activeLoans[0].due_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      {/* Loan Products */}
      {loanProducts.length > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Available Loan Products</h3>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            {loanProducts.map((product) => (
              <div key={product.id} className="p-4">
                <h4 className="font-medium mb-2">{product.name}</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Max: UGX {product.max_amount.toLocaleString()}</p>
                  <p>Interest: {product.interest_rate}% p.a.</p>
                  <p>Terms: {product.term_months.join(', ')} months</p>
                  <p>Fee: {product.processing_fee}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Loan History */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Your Loans</h3>
        </div>
        <div className="divide-y">
          {allLoans.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No loans yet. Apply for your first loan!</p>
            </div>
          ) : (
            allLoans.map((loan) => (
            <Link
              key={loan.id}
              href={`/sacco/loans/${loan.id}`}
              className="flex items-center justify-between p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{loan.product}</p>
                    <span className={cn('px-2 py-0.5 text-xs rounded-full capitalize', getStatusStyles(loan.status))}>
                      {loan.status === 'paid_off' ? 'Paid Off' : loan.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Borrowed: UGX {loan.amount.toLocaleString()} • {loan.interest_rate}% interest
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  {loan.status === 'active' ? (
                    <>
                      <p className="font-semibold">UGX {loan.balance.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">remaining</p>
                    </>
                  ) : loan.status === 'paid_off' ? (
                    <p className="text-green-600 font-medium">Fully Paid</p>
                  ) : null}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
            ))
          )}
        </div>
      </div>
      
      {/* Eligibility Info */}
      {membership && (
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Loan Eligibility</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You can borrow up to 3x your total savings. Your current savings: UGX {(membership.savings_balance ?? 0).toLocaleString()}, 
                making you eligible for loans up to UGX {((membership.savings_balance ?? 0) * 3).toLocaleString()}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
