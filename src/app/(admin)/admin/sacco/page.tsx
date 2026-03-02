'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import {
  Search,
  Users,
  Wallet,
  TrendingUp,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaccoMember {
  id: number;
  member_number: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  status: 'active' | 'pending_approval' | 'suspended' | 'resigned';
  shares_count?: number;
  savings_balance?: number;
  loans_balance?: number;
  joined_at: string;
}

interface SaccoLoan {
  id: number;
  loan_number: string;
  member: {
    id: number;
    user: {
      name: string;
    };
  };
  principal_amount: number;
  purpose: string;
  status: 'pending_approval' | 'approved' | 'active' | 'rejected' | 'paid_off' | 'overdue';
  created_at: string;
}

interface DashboardStats {
  members: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  loans: {
    total: number;
    pending: number;
    active: number;
    overdue: number;
    total_disbursed: number;
    total_outstanding: number;
  };
  financial: {
    total_deposits: number;
    total_withdrawals: number;
    total_repayments: number;
  };
}

interface SaccoReportData {
  summary: {
    total_share_capital: number;
    total_savings: number;
    outstanding_loans: number;
    default_rate: number;
    share_capital_growth: number;
    savings_growth: number;
    loan_to_capital_ratio: number;
  };
  monthly_savings: Array<{
    month: string;
    deposits: number;
    withdrawals: number;
  }>;
  monthly_loans: Array<{
    month: string;
    disbursed: number;
    repaid: number;
    count: number;
  }>;
  kpis: {
    loan_recovery_rate: number;
    avg_loan_to_savings: number;
    avg_interest_earned: number;
    member_retention: number;
  };
}

export default function SACCOPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'loans' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch dashboard stats
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ['sacco-dashboard'],
    queryFn: () => apiGet<{ data: DashboardStats }>('/admin/sacco/dashboard'),
  });

  // Fetch members
  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['sacco-members', statusFilter, searchTerm],
    queryFn: () => apiGet<{ data: { data: SaccoMember[] } }>('/admin/sacco/members', {
      params: {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      }
    }),
  });

  // Fetch loans
  const { data: loansData, isLoading: loadingLoans } = useQuery({
    queryKey: ['sacco-loans', statusFilter, searchTerm],
    queryFn: () => apiGet<{ data: { data: SaccoLoan[] } }>('/admin/sacco/loans', {
      params: {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      }
    }),
  });

  // Fetch reports data
  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ['sacco-reports'],
    queryFn: () => apiGet<{ data: SaccoReportData }>('/admin/sacco/reports'),
    enabled: activeTab === 'reports',
  });

  // Approve member mutation
  const approveMemberMutation = useMutation({
    mutationFn: (memberId: number) => apiPost(`/admin/sacco/members/${memberId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco-members'] });
      queryClient.invalidateQueries({ queryKey: ['sacco-dashboard'] });
    },
  });

  // Approve loan mutation
  const approveLoanMutation = useMutation({
    mutationFn: (loanId: number) => apiPost(`/admin/sacco/loans/${loanId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco-loans'] });
      queryClient.invalidateQueries({ queryKey: ['sacco-dashboard'] });
    },
  });

  // Reject loan mutation
  const rejectLoanMutation = useMutation({
    mutationFn: ({ loanId, reason }: { loanId: number; reason: string }) =>
      apiPost(`/admin/sacco/loans/${loanId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco-loans'] });
      queryClient.invalidateQueries({ queryKey: ['sacco-dashboard'] });
    },
  });

  const stats = dashboardData?.data;
  const members = membersData?.data?.data || [];
  const loans = loansData?.data?.data || [];
  const reports = reportsData?.data;

  const pendingMembers = members.filter(m => m.status === 'pending_approval');
  const pendingLoans = loans.filter(l => l.status === 'pending_approval');

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `UGX ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(0)}M`;
    return `UGX ${amount.toLocaleString()}`;
  };

  const handleDownloadReport = async (reportType: string, format: 'pdf' | 'excel') => {
    try {
      const response = await apiGet<Blob>(`/admin/sacco/reports/download`, {
        params: { type: reportType, format },
        responseType: 'blob',
      });
      const blob = response instanceof Blob ? response : new Blob([JSON.stringify(response)]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sacco-${reportType}-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // Silently fail — API may not support report downloads yet
    }
  };

  const statusStyles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SACCO Management</h1>
          <p className="text-muted-foreground">Artist Savings & Credit Cooperative</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['overview', 'members', 'loans', 'reports'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          {loadingDashboard ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{stats?.members?.total?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">UGX {((stats?.financial?.total_deposits || 0) / 1000000000).toFixed(1)}B</p>
                <p className="text-sm text-muted-foreground">Total Savings</p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">UGX {((stats?.loans?.total_outstanding || 0) / 1000000).toFixed(0)}M</p>
                <p className="text-sm text-muted-foreground">Active Loans</p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{stats?.loans?.pending || 0}</p>
                <p className="text-sm text-muted-foreground">Pending Loans</p>
              </div>
            </div>
          )}

          {/* Pending Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Memberships */}
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="font-semibold mb-4">Pending Memberships</h2>
              <div className="space-y-3">
                {pendingMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{member.user?.name || member.member_number}</p>
                      <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMemberMutation.mutate(member.id)}
                        disabled={approveMemberMutation.isPending}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {pendingMembers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No pending memberships</p>
                )}
              </div>
            </div>

            {/* Pending Loans */}
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="font-semibold mb-4">Pending Loan Applications</h2>
              <div className="space-y-3">
                {pendingLoans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{loan.member?.user?.name || loan.loan_number}</p>
                      <p className="text-sm text-muted-foreground">
                        UGX {loan.principal_amount?.toLocaleString()} - {loan.purpose}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveLoanMutation.mutate(loan.id)}
                        disabled={approveLoanMutation.isPending}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/admin/sacco/loans/${loan.id}`}
                        className="p-2 bg-primary text-primary-foreground rounded-lg"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
                {pendingLoans.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No pending loan applications</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending_approval">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {loadingMembers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium">Member</th>
                    <th className="p-4 text-left text-sm font-medium">Member #</th>
                    <th className="p-4 text-left text-sm font-medium">Status</th>
                    <th className="p-4 text-left text-sm font-medium">Joined</th>
                    <th className="p-4 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{member.user?.name}</p>
                          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                        </div>
                      </td>
                      <td className="p-4">{member.member_number}</td>
                      <td className="p-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium capitalize',
                          member.status === 'active' ? statusStyles.active :
                          member.status === 'pending_approval' ? statusStyles.pending :
                          member.status === 'suspended' ? statusStyles.suspended : ''
                        )}>
                          {member.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">{member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '-'}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Link
                            href={`/admin/sacco/members/${member.id}`}
                            className="p-2 hover:bg-muted rounded-lg inline-block"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {member.status === 'pending_approval' && (
                            <button
                              onClick={() => approveMemberMutation.mutate(member.id)}
                              disabled={approveMemberMutation.isPending}
                              className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search loans..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending_approval">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loadingLoans ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium">Member</th>
                    <th className="p-4 text-left text-sm font-medium">Loan #</th>
                    <th className="p-4 text-left text-sm font-medium">Amount</th>
                    <th className="p-4 text-left text-sm font-medium">Purpose</th>
                    <th className="p-4 text-left text-sm font-medium">Status</th>
                    <th className="p-4 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-muted/50">
                      <td className="p-4 font-medium">{loan.member?.user?.name || '-'}</td>
                      <td className="p-4">{loan.loan_number}</td>
                      <td className="p-4">UGX {loan.principal_amount?.toLocaleString()}</td>
                      <td className="p-4">{loan.purpose || '-'}</td>
                      <td className="p-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium capitalize',
                          loan.status === 'pending_approval' ? statusStyles.pending :
                          loan.status === 'approved' || loan.status === 'active' || loan.status === 'paid_off' ? statusStyles.approved :
                          loan.status === 'rejected' ? statusStyles.rejected : ''
                        )}>
                          {loan.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Link
                            href={`/admin/sacco/loans/${loan.id}`}
                            className="p-2 hover:bg-muted rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {loan.status === 'pending_approval' && (
                            <>
                              <button
                                onClick={() => approveLoanMutation.mutate(loan.id)}
                                disabled={approveLoanMutation.isPending}
                                className="p-2 hover:bg-green-100 rounded-lg text-green-600 disabled:opacity-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => rejectLoanMutation.mutate({ loanId: loan.id, reason: 'Rejected by admin' })}
                                disabled={rejectLoanMutation.isPending}
                                className="p-2 hover:bg-red-100 rounded-lg text-red-600 disabled:opacity-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {loans.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No loans found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {loadingReports ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Report Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-card">
                  <p className="text-sm text-muted-foreground">Total Share Capital</p>
                  <p className="text-2xl font-bold">{formatCurrency(reports?.summary?.total_share_capital || 0)}</p>
                  {reports?.summary?.share_capital_growth !== undefined && (
                    <p className={cn('text-xs mt-1', reports.summary.share_capital_growth >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {reports.summary.share_capital_growth >= 0 ? '+' : ''}{reports.summary.share_capital_growth.toFixed(1)}% from last year
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-xl border bg-card">
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                  <p className="text-2xl font-bold">{formatCurrency(reports?.summary?.total_savings || 0)}</p>
                  {reports?.summary?.savings_growth !== undefined && (
                    <p className={cn('text-xs mt-1', reports.summary.savings_growth >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {reports.summary.savings_growth >= 0 ? '+' : ''}{reports.summary.savings_growth.toFixed(1)}% from last year
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-xl border bg-card">
                  <p className="text-sm text-muted-foreground">Outstanding Loans</p>
                  <p className="text-2xl font-bold">{formatCurrency(reports?.summary?.outstanding_loans || 0)}</p>
                  {reports?.summary?.loan_to_capital_ratio !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {reports.summary.loan_to_capital_ratio.toFixed(0)}% of total capital
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-xl border bg-card">
                  <p className="text-sm text-muted-foreground">Default Rate</p>
                  <p className="text-2xl font-bold">{(reports?.summary?.default_rate || 0).toFixed(1)}%</p>
                  <p className={cn('text-xs mt-1', (reports?.summary?.default_rate || 0) < 5 ? 'text-green-600' : 'text-red-600')}>
                    {(reports?.summary?.default_rate || 0) < 5 ? 'Below' : 'Above'} 5% target
                  </p>
                </div>
              </div>

              {/* Available Reports */}
              <div className="rounded-xl border bg-card">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Generate Reports</h3>
                  <p className="text-sm text-muted-foreground">Download financial reports for the SACCO</p>
                </div>
                <div className="divide-y">
                  {[
                    { name: 'Membership Report', type: 'membership', description: 'All member details, shares, and savings', icon: Users },
                    { name: 'Loan Performance Report', type: 'loan-performance', description: 'Active loans, repayment history, defaults', icon: FileText },
                    { name: 'Savings Summary', type: 'savings', description: 'Deposits, withdrawals, interest earned', icon: Wallet },
                    { name: 'Share Register', type: 'share-register', description: 'Complete share ownership records', icon: TrendingUp },
                    { name: 'Financial Statements', type: 'financial-statements', description: 'Income, expenses, balance sheet', icon: FileText },
                  ].map((report) => (
                    <div key={report.name} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <report.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadReport(report.type, 'pdf')}
                          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report.type, 'excel')}
                          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted"
                        >
                          Excel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="font-semibold mb-4">Monthly Savings Trend</h3>
                  <div className="space-y-3">
                    {(reports?.monthly_savings || []).length > 0 ? (
                      reports!.monthly_savings.map((row) => (
                        <div key={row.month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="font-medium">{row.month}</span>
                          <div className="flex gap-6">
                            <span className="text-green-600">+{(row.deposits / 1000000).toFixed(0)}M</span>
                            <span className="text-red-600">-{(row.withdrawals / 1000000).toFixed(0)}M</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No savings data available</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                  <h3 className="font-semibold mb-4">Loan Disbursement Trend</h3>
                  <div className="space-y-3">
                    {(reports?.monthly_loans || []).length > 0 ? (
                      reports!.monthly_loans.map((row) => (
                        <div key={row.month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <span className="font-medium">{row.month}</span>
                            <span className="text-sm text-muted-foreground ml-2">({row.count} loans)</span>
                          </div>
                          <div className="flex gap-6">
                            <span className="text-blue-600">+{(row.disbursed / 1000000).toFixed(0)}M</span>
                            <span className="text-green-600">↩{(row.repaid / 1000000).toFixed(0)}M</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No loan data available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-semibold mb-4">Key Performance Indicators</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{(reports?.kpis?.loan_recovery_rate || 0).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Loan Recovery Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{(reports?.kpis?.avg_loan_to_savings || 0).toFixed(1)}x</p>
                    <p className="text-sm text-muted-foreground">Avg. Loan to Savings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{(reports?.kpis?.avg_interest_earned || 0).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Avg. Interest Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-600">{(reports?.kpis?.member_retention || 0).toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">Member Retention</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
