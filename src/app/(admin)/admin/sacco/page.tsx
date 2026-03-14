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
import { PlannedFeatureState } from '@/components/sacco/shared';

interface SaccoMember {
  id: number;
  member_number: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  username?: string;
  email?: string;
  status: 'active' | 'pending_approval' | 'suspended' | 'resigned';
  shares_count?: number;
  savings_balance?: number;
  loans_balance?: number;
  total_savings?: number;
  joined_at: string;
}

interface SaccoLoan {
  id: number;
  loan_number: string;
  member?: {
    id: number;
    user: {
      name: string;
    };
  };
  member_name?: string;
  principal_amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'active' | 'disbursed' | 'rejected' | 'paid_off' | 'overdue' | 'completed';
  created_at: string;
}

interface DashboardStats {
  total_members: number;
  total_loans: number;
  active_loans: number;
  pending_loans: number;
  total_savings: number;
  total_loans_amount: number;
  total_disbursed: number;
}

export default function SACCOPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'loans' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch dashboard stats
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ['sacco-dashboard'],
    queryFn: () => apiGet<{ success: boolean; data: DashboardStats }>('/admin/sacco/stats'),
  });

  // Fetch members
  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['sacco-members', statusFilter, searchTerm],
    queryFn: () => apiGet<{ success: boolean; data: SaccoMember[] }>('/admin/sacco/members', {
      params: {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      }
    }),
  });

  // Fetch loans
  const { data: loansData, isLoading: loadingLoans } = useQuery({
    queryKey: ['sacco-loans', statusFilter, searchTerm],
    queryFn: () => apiGet<{ success: boolean; data: SaccoLoan[] }>('/admin/sacco/loans', {
      params: {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      }
    }),
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
  const members = membersData?.data || [];
  const loans = loansData?.data || [];

  const pendingMembers = members.filter((member) => member.status === 'pending_approval');
  const pendingLoans = loans.filter((loan) => loan.status === 'pending');

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `UGX ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(0)}M`;
    return `UGX ${amount.toLocaleString()}`;
  };

  const statusStyles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    disbursed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
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
                <p className="text-2xl font-bold">{stats?.total_members?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">UGX {((stats?.total_savings || 0) / 1000000000).toFixed(1)}B</p>
                <p className="text-sm text-muted-foreground">Total Savings</p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">UGX {((stats?.total_loans_amount || 0) / 1000000).toFixed(0)}M</p>
                <p className="text-sm text-muted-foreground">Active Loans</p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{stats?.pending_loans || 0}</p>
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
                      <p className="font-medium">{member.username || member.user?.name || member.member_number}</p>
                      <p className="text-sm text-muted-foreground">{member.email || member.user?.email || 'No email recorded'}</p>
                    </div>
                    <Link
                      href={`/admin/sacco/members/${member.id}`}
                      className="p-2 bg-primary text-primary-foreground rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
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
                      <p className="font-medium">{loan.member_name || loan.member?.user?.name || loan.loan_number}</p>
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
                          <p className="font-medium">{member.username || member.user?.name || member.member_number}</p>
                          <p className="text-sm text-muted-foreground">{member.email || member.user?.email || 'No email recorded'}</p>
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="disbursed">Disbursed</option>
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
                      <td className="p-4 font-medium">{loan.member_name || loan.member?.user?.name || '-'}</td>
                      <td className="p-4">{loan.loan_number}</td>
                      <td className="p-4">UGX {loan.principal_amount?.toLocaleString()}</td>
                      <td className="p-4">{loan.purpose || '-'}</td>
                      <td className="p-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium capitalize',
                          loan.status === 'pending' ? statusStyles.pending :
                          loan.status === 'disbursed' ? statusStyles.disbursed :
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
                          {loan.status === 'pending' && (
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
        <PlannedFeatureState
          title="Admin reporting is being normalized"
          description="The old SACCO admin reports UI was wired to routes that do not exist on the backend. We have kept the stable admin finance operations live and moved reporting into a dedicated rebuild lane."
          phase="Contract rebuild in progress"
        />
      )}
    </div>
  );
}
