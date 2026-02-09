'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { 
  ChevronLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Wallet,
  Coins,
  CreditCard,
  TrendingUp,
  MoreVertical,
  Ban,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_payment' | 'share_purchase' | 'dividend';
  amount: number;
  description: string;
  date: string;
}

export default function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'loans' | 'shares'>('overview');
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Mock member data
  const member = {
    id: parseInt(resolvedParams.id),
    name: 'Eddy Kenzo',
    email: 'kenzo@email.com',
    phone: '+256 700 987654',
    memberNumber: 'TTS-2023-0001',
    memberSince: '2023-01-15',
    status: 'active' as const,
    savings: {
      balance: 5000000,
      thisMonth: 500000,
      interestEarned: 450000,
    },
    shares: {
      count: 50,
      value: 500000,
      dividendsEarned: 50000,
    },
    loans: {
      active: 0,
      total: 3,
      totalBorrowed: 8000000,
      totalRepaid: 8000000,
    },
    riskProfile: 'Low',
    lastActivity: '2026-02-07',
  };

  const transactions: Transaction[] = [
    { id: 1, type: 'deposit', amount: 200000, description: 'Monthly savings', date: '2026-02-05' },
    { id: 2, type: 'loan_payment', amount: 150000, description: 'Loan repayment #6', date: '2026-02-01' },
    { id: 3, type: 'share_purchase', amount: 100000, description: 'Purchased 10 shares', date: '2026-01-20' },
    { id: 4, type: 'deposit', amount: 300000, description: 'Performance bonus deposit', date: '2026-01-15' },
    { id: 5, type: 'dividend', amount: 50000, description: 'Annual dividend 2025', date: '2025-12-31' },
    { id: 6, type: 'withdrawal', amount: 500000, description: 'Emergency withdrawal', date: '2025-12-20' },
  ];

  const loanHistory = [
    { id: 1, type: 'Standard Loan', amount: 3000000, status: 'completed', startDate: '2023-06-01', endDate: '2024-06-01' },
    { id: 2, type: 'Emergency Loan', amount: 500000, status: 'completed', startDate: '2024-03-01', endDate: '2024-05-31' },
    { id: 3, type: 'Development Loan', amount: 4500000, status: 'completed', startDate: '2024-09-01', endDate: '2025-09-01' },
  ];

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'dividend':
        return 'text-green-600';
      case 'withdrawal':
      case 'loan_disbursement':
        return 'text-red-600';
      case 'loan_payment':
        return 'text-blue-600';
      case 'share_purchase':
        return 'text-purple-600';
      default:
        return 'text-foreground';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'suspended':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

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
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{member.name}</h1>
              <p className="text-muted-foreground">{member.memberNumber}</p>
              <span className={cn(
                'mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                getStatusStyles(member.status)
              )}>
                {member.status}
              </span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="p-2 hover:bg-muted rounded-lg"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showActionsMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-background shadow-lg z-10">
                <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-left">
                  <Mail className="h-4 w-4" />
                  Send Email
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-left text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  Issue Warning
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-left text-red-600">
                  <Ban className="h-4 w-4" />
                  Suspend Member
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{member.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{member.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Member since {new Date(member.memberSince).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold">UGX {(member.savings.balance / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-muted-foreground">Total Savings</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">{member.shares.count}</p>
          <p className="text-sm text-muted-foreground">Shares Owned</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">{member.loans.total}</p>
          <p className="text-sm text-muted-foreground">Total Loans</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">{member.riskProfile}</p>
          <p className="text-sm text-muted-foreground">Risk Profile</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['overview', 'transactions', 'loans', 'shares'] as const).map((tab) => (
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
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Savings Summary */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Savings Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="font-bold">UGX {member.savings.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">This Month Deposits</span>
                <span className="font-medium text-green-600">+UGX {member.savings.thisMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Total Interest Earned</span>
                <span className="font-medium">UGX {member.savings.interestEarned.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shares Summary */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Shares Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Total Shares</span>
                <span className="font-bold">{member.shares.count} shares</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Current Value</span>
                <span className="font-medium">UGX {member.shares.value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Dividends Earned</span>
                <span className="font-medium text-purple-600">UGX {member.shares.dividendsEarned.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Loan Summary */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Loan Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Active Loans</span>
                <span className="font-bold">{member.loans.active}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Total Borrowed</span>
                <span className="font-medium">UGX {member.loans.totalBorrowed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Total Repaid</span>
                <span className="font-medium text-green-600">UGX {member.loans.totalRepaid.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Member Notes */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Member Notes</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Excellent Payment History</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-300">
                  All 3 loans repaid on time. Zero defaults.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Active member with consistent monthly savings. Last activity: {new Date(member.lastActivity).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Recent Transactions</h2>
          </div>
          <div className="divide-y">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString()} • {tx.type.replace('_', ' ')}
                  </p>
                </div>
                <p className={cn('font-semibold', getTransactionColor(tx.type))}>
                  {tx.type === 'deposit' || tx.type === 'dividend' ? '+' : '-'}
                  UGX {tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Loan History</h2>
          </div>
          <div className="divide-y">
            {loanHistory.map((loan) => (
              <Link
                key={loan.id}
                href={`/admin/sacco/loans/${loan.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{loan.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(loan.startDate).toLocaleDateString()} - {new Date(loan.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">UGX {loan.amount.toLocaleString()}</p>
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full capitalize',
                    getStatusStyles(loan.status)
                  )}>
                    {loan.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Shares Tab */}
      {activeTab === 'shares' && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Share Holdings</h2>
            <div className="p-6 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-blue-100 text-sm">Total Shares</p>
                  <p className="text-3xl font-bold">{member.shares.count}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Current Value</p>
                  <p className="text-3xl font-bold">UGX {(member.shares.value / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Ownership</p>
                  <p className="text-3xl font-bold">0.021%</p>
                </div>
              </div>
            </div>

            <h3 className="font-medium mb-3">Share Purchase History</h3>
            <div className="space-y-2">
              {[
                { date: '2026-01-20', shares: 10, amount: 100000 },
                { date: '2025-06-15', shares: 15, amount: 150000 },
                { date: '2024-12-01', shares: 10, amount: 100000 },
                { date: '2023-01-15', shares: 15, amount: 150000 },
              ].map((purchase, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{purchase.shares} shares</p>
                    <p className="text-sm text-muted-foreground">{new Date(purchase.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-medium">UGX {purchase.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
