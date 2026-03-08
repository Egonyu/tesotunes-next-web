'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Loader2,
  Wallet,
  Gift,
  CreditCard,
  ReceiptText,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet } from '@/lib/api';

// ============================================================================
// Types — normalized from multiple API sources
// ============================================================================

interface UnifiedTransaction {
  id: string;
  source: 'wallet' | 'credits' | 'subscription';
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  category?: string;
  reference?: string;
}

interface WalletTx {
  id: number;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  created_at?: string;
  date?: string;
  reference?: string;
}

interface CreditTx {
  id: number;
  type: string;
  description: string;
  amount: number;
  balance_after?: number;
  source?: string;
  created_at: string;
}

interface SubBilling {
  id: number;
  plan: { name: string; slug: string };
  status: string;
  amount_paid: number;
  currency: string;
  payment_method: string;
  started_at: string;
  created_at: string;
}

// ============================================================================
// Tabs
// ============================================================================

type TabKey = 'all' | 'wallet' | 'credits' | 'subscription';

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: ReceiptText },
  { key: 'wallet', label: 'Wallet (UGX)', icon: Wallet },
  { key: 'credits', label: 'Credits', icon: Gift },
  { key: 'subscription', label: 'Subscription', icon: CreditCard },
];

// ============================================================================
// Page
// ============================================================================

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  // Fetch all three sources in parallel
  const { data: walletTxs, isLoading: wLoading } = useQuery({
    queryKey: ['transactions', 'wallet'],
    queryFn: () =>
      apiGet<{ data: WalletTx[] } | WalletTx[]>('/payments/wallet/transactions?limit=200').then(
        (res) => (Array.isArray(res) ? res : (res as { data: WalletTx[] }).data ?? [])
      ),
  });

  const { data: creditTxs, isLoading: cLoading } = useQuery({
    queryKey: ['transactions', 'credits'],
    queryFn: () =>
      apiGet<CreditTx[] | { data: CreditTx[] }>('/credits/history').then((res) =>
        Array.isArray(res) ? res : (res as { data: CreditTx[] }).data ?? []
      ),
  });

  const { data: subBilling, isLoading: sLoading } = useQuery({
    queryKey: ['transactions', 'subscription'],
    queryFn: () =>
      apiGet<SubBilling[] | { data: SubBilling[] }>('/user/subscription/history').then((res) =>
        Array.isArray(res) ? res : (res as { data: SubBilling[] }).data ?? []
      ),
  });

  const isLoading = wLoading || cLoading || sLoading;

  // Normalize all sources into a unified shape
  const unified = useMemo<UnifiedTransaction[]>(() => {
    const items: UnifiedTransaction[] = [];

    // Wallet transactions
    (walletTxs ?? []).forEach((tx) => {
      items.push({
        id: `w-${tx.id}`,
        source: 'wallet',
        type: tx.type,
        description: tx.description,
        amount: tx.amount,
        currency: 'UGX',
        status: tx.status,
        date: tx.created_at || tx.date || '',
        reference: tx.reference,
      });
    });

    // Credit transactions
    (creditTxs ?? []).forEach((tx) => {
      const isDebit = tx.type === 'spend' || tx.type === 'debit' || tx.amount < 0;
      items.push({
        id: `c-${tx.id}`,
        source: 'credits',
        type: isDebit ? 'debit' : 'credit',
        description: tx.description || tx.source || tx.type,
        amount: Math.abs(tx.amount),
        currency: 'Credits',
        status: 'completed',
        date: tx.created_at,
        category: tx.source,
      });
    });

    // Subscription billing
    (subBilling ?? []).forEach((tx) => {
      items.push({
        id: `s-${tx.id}`,
        source: 'subscription',
        type: 'debit',
        description: `${tx.plan.name} subscription`,
        amount: tx.amount_paid,
        currency: tx.currency || 'UGX',
        status: tx.status === 'active' ? 'completed' : tx.status === 'cancelled' ? 'failed' : 'completed',
        date: tx.created_at || tx.started_at,
      });
    });

    // Sort by date descending
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [walletTxs, creditTxs, subBilling]);

  // Apply filters
  const filtered = useMemo(() => {
    return unified.filter((tx) => {
      if (activeTab !== 'all' && tx.source !== activeTab) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (
        searchQuery &&
        !tx.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(tx.reference ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [unified, activeTab, statusFilter, searchQuery]);

  // Pagination
  const perPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const formatDate = (d: string) => {
    if (!d) return '—';
    const date = new Date(d);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const sourceIcon = (source: string) => {
    switch (source) {
      case 'wallet': return <Wallet className="h-4 w-4" />;
      case 'credits': return <Gift className="h-4 w-4" />;
      case 'subscription': return <CreditCard className="h-4 w-4" />;
      default: return <ReceiptText className="h-4 w-4" />;
    }
  };

  const sourceColor = (source: string) => {
    switch (source) {
      case 'wallet': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'credits': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'subscription': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container py-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground text-sm mt-1">All your financial activity in one place</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setPage(1); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
            className="px-3 py-2 rounded-lg border bg-background text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border bg-card text-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold">{filtered.length}</p>
        </div>
        <div className="p-3 rounded-xl border bg-card text-center">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="text-lg font-bold text-green-600">
            {filtered.filter((t) => t.type === 'credit').length}
          </p>
        </div>
        <div className="p-3 rounded-xl border bg-card text-center">
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="text-lg font-bold text-red-600">
            {filtered.filter((t) => t.type === 'debit').length}
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Transaction List */}
      {!isLoading && pageItems.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ReceiptText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No transactions found</p>
          <p className="text-sm mt-1">Try adjusting your filters or check back later</p>
        </div>
      )}

      {!isLoading && pageItems.length > 0 && (
        <div className="rounded-xl border divide-y bg-card">
          {pageItems.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
              {/* Icon */}
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                  tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                )}
              >
                {tx.type === 'credit' ? (
                  <ArrowDownCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowUpCircle className="h-5 w-5 text-red-600" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', sourceColor(tx.source))}>
                    {sourceIcon(tx.source)}
                    {tx.source}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                </div>
              </div>

              {/* Amount & Status */}
              <div className="text-right shrink-0">
                <p
                  className={cn(
                    'font-semibold text-sm',
                    tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {tx.type === 'credit' ? '+' : '-'}
                  {tx.currency === 'Credits' ? '' : 'UGX '}
                  {tx.amount.toLocaleString()}
                  {tx.currency === 'Credits' ? ' credits' : ''}
                </p>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    tx.status === 'completed' && 'text-green-600',
                    tx.status === 'pending' && 'text-amber-600',
                    tx.status === 'failed' && 'text-red-600'
                  )}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({filtered.length} transactions)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="flex gap-3 text-sm pt-2 border-t">
        <Link href="/wallet" className="text-primary hover:underline">Wallet</Link>
        <Link href="/credits" className="text-primary hover:underline">Credits</Link>
        <Link href="/settings/subscription" className="text-primary hover:underline">Subscription</Link>
      </div>
    </div>
  );
}
