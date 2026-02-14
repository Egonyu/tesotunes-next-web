'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { 
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  AlertCircle,
  DollarSign,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoanDetail {
  id: number;
  loan_number: string;
  principal_amount: number;
  interest_rate: number;
  term_months: number;
  purpose: string;
  status: 'pending_approval' | 'approved' | 'active' | 'rejected' | 'paid_off' | 'overdue';
  monthly_payment?: number;
  total_repayment?: number;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  member: {
    id: number;
    member_number: string;
    savings_balance?: number;
    shares_count?: number;
    user: {
      id: number;
      name: string;
      email: string;
      phone?: string;
    };
  };
  guarantors?: Array<{
    id: number;
    name: string;
    relationship: string;
    shares_count?: number;
    status: string;
  }>;
  documents?: Array<{
    id: number;
    name: string;
    status: 'pending' | 'verified' | 'rejected';
    url?: string;
  }>;
}

export default function AdminLoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const loanId = parseInt(resolvedParams.id);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch loan details
  const { data: loanData, isLoading, error } = useQuery({
    queryKey: ['sacco-loan', loanId],
    queryFn: () => apiGet<{ data: LoanDetail }>(`/admin/sacco/loans/${loanId}`),
  });

  const loan = loanData?.data;

  // Approve loan mutation
  const approveMutation = useMutation({
    mutationFn: () => apiPost(`/admin/sacco/loans/${loanId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco-loan', loanId] });
      queryClient.invalidateQueries({ queryKey: ['sacco-loans'] });
      queryClient.invalidateQueries({ queryKey: ['sacco-dashboard'] });
    },
  });

  // Reject loan mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) => apiPost(`/admin/sacco/loans/${loanId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco-loan', loanId] });
      queryClient.invalidateQueries({ queryKey: ['sacco-loans'] });
      queryClient.invalidateQueries({ queryKey: ['sacco-dashboard'] });
      setShowRejectModal(false);
      setRejectionReason('');
    },
  });

  const handleApprove = () => {
    approveMutation.mutate();
  };

  const handleReject = () => {
    rejectMutation.mutate(rejectionReason);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending_approval':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
      case 'active':
      case 'paid_off':
      case 'verified':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Loan not found</h2>
        <p className="text-muted-foreground mt-2">The requested loan application could not be found.</p>
        <Link href="/admin/sacco" className="text-primary hover:underline mt-4 inline-block">
          Back to SACCO
        </Link>
      </div>
    );
  }

  const loanStatus = loan.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link 
          href="/admin/sacco"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to SACCO
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Loan Application #{loan.loan_number || loan.id}</h1>
            <p className="text-muted-foreground">
              Applied on {new Date(loan.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-medium capitalize',
            getStatusStyles(loanStatus)
          )}>
            {loanStatus?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loan Details */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Loan Request Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Requested Amount</p>
                <p className="text-2xl font-bold">UGX {loan.principal_amount?.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Loan Number</p>
                <p className="text-lg font-semibold">{loan.loan_number}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Term</p>
                <p className="text-lg font-semibold">{loan.term_months} months</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-lg font-semibold">{loan.interest_rate}% p.a.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="text-lg font-semibold">UGX {loan.monthly_payment?.toLocaleString() || '-'}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Total Repayment</p>
                <p className="text-lg font-semibold">UGX {loan.total_repayment?.toLocaleString() || '-'}</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Purpose</p>
              <p className="font-medium mt-1">{loan.purpose || 'Not specified'}</p>
            </div>
          </div>

          {/* Member Info */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Applicant Information</h2>
            <div className="flex items-start gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <Link 
                  href={`/admin/sacco/members/${loan.member.id}`}
                  className="text-lg font-semibold hover:text-primary"
                >
                  {loan.member.user?.name || 'Unknown'}
                </Link>
                <p className="text-muted-foreground">{loan.member.user?.email}</p>
                <p className="text-muted-foreground">{loan.member.user?.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Savings</p>
                <p className="font-semibold">UGX {loan.member.savings_balance?.toLocaleString() || '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Shares</p>
                <p className="font-semibold">{loan.member.shares_count || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Member #</p>
                <p className="font-semibold">{loan.member.member_number}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold">{loanStatus?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Guarantors */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Guarantors</h2>
            <div className="space-y-3">
              {loan.guarantors && loan.guarantors.length > 0 ? loan.guarantors.map((guarantor, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{guarantor.name}</p>
                      <p className="text-sm text-muted-foreground">{guarantor.relationship}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{guarantor.shares_count || 0} shares</p>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      getStatusStyles(guarantor.status)
                    )}>
                      {guarantor.status}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4">No guarantors listed</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Supporting Documents</h2>
            <div className="space-y-3">
              {loan.documents && loan.documents.length > 0 ? loan.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full capitalize',
                      getStatusStyles(doc.status)
                    )}>
                      {doc.status}
                    </span>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View</a>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Loan Summary */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Loan Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Principal Amount</span>
                <span className="font-semibold">
                  UGX {loan.principal_amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Interest Rate</span>
                <span className="font-semibold">
                  {loan.interest_rate}% p.a.
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Term</span>
                <span className="font-semibold">
                  {loan.term_months} months
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Status</span>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium capitalize',
                  getStatusStyles(loanStatus)
                )}>
                  {loanStatus?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {loanStatus === 'pending_approval' && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-semibold mb-4">Decision</h2>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors',
                    approveMutation.isPending
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  )}
                >
                  <CheckCircle className="h-5 w-5" />
                  {approveMutation.isPending ? 'Processing...' : 'Approve Loan'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  <XCircle className="h-5 w-5" />
                  Reject Application
                </button>
              </div>
            </div>
          )}

          {/* Approval Success */}
          {(loanStatus === 'approved' || loanStatus === 'active') && (
            <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="font-semibold text-green-900 dark:text-green-100">Loan Approved</h2>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                This loan has been approved. The funds will be disbursed to the member&apos;s account within 24-48 hours.
              </p>
            </div>
          )}

          {/* Rejection Notice */}
          {loanStatus === 'rejected' && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <h2 className="font-semibold text-red-900 dark:text-red-100">Loan Rejected</h2>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                This loan application has been rejected. 
                {loan.rejection_reason && <span className="block mt-2">Reason: {loan.rejection_reason}</span>}
              </p>
            </div>
          )}

          {/* Risk Assessment */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Risk Assessment</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  This member has a good track record with 2 successfully repaid loans. 
                  Debt-to-income ratio is within acceptable limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Reject Loan Application</h3>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Please provide a reason for rejecting this loan application. 
                This will be sent to the member.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-3 rounded-lg border bg-background resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2 rounded-lg border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason || rejectMutation.isPending}
                  className={cn(
                    'flex-1 py-2 rounded-lg font-medium transition-colors',
                    !rejectionReason || rejectMutation.isPending
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  )}
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
