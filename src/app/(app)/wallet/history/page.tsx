'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  Search,
  Calendar,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWalletTransactions } from '@/hooks/usePayments';

export default function TransactionHistoryPage() {
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  
  const { data: txResponse, isLoading } = useWalletTransactions(page, 50);

  // Handle various response shapes from the API
  const rawData = txResponse as Record<string, unknown> | undefined;
  const transactions = (
    Array.isArray(rawData?.data) ? rawData.data :
    Array.isArray(rawData) ? rawData : []
  ) as Array<{
    id: number;
    type: 'credit' | 'debit';
    category?: string;
    description: string;
    amount: number;
    date?: string;
    created_at?: string;
    status: 'completed' | 'pending' | 'failed';
    reference?: string;
  }>;
  
  const filteredTransactions = transactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (searchQuery && !tx.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const txDate = tx.date || tx.created_at || '';
    const date = new Date(txDate).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, typeof filteredTransactions>);
  
  const getGroupLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="container py-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/wallet"
            className="p-2 hover:bg-muted rounded-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Transaction History</h1>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg">
          <Download className="h-5 w-5" />
        </button>
      </div>
      
      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
          <Calendar className="h-5 w-5" />
          Date
        </button>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'credit', 'debit'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize',
              filter === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {type === 'all' ? 'All' : type === 'credit' ? 'Money In' : 'Money Out'}
          </button>
        ))}
      </div>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <ArrowDownCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Total In</span>
              </div>
              <p className="text-xl font-bold mt-1 text-green-700 dark:text-green-300">
                UGX {transactions
                  .filter(tx => tx.type === 'credit')
                  .reduce((sum, tx) => sum + tx.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <ArrowUpCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Total Out</span>
              </div>
              <p className="text-xl font-bold mt-1 text-red-700 dark:text-red-300">
                UGX {transactions
                  .filter(tx => tx.type === 'debit')
                  .reduce((sum, tx) => sum + tx.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Transactions List */}
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {getGroupLabel(date)}
                </h3>
                <div className="rounded-xl border bg-card overflow-hidden divide-y">
                  {txs.map((tx) => {
                    const txDate = tx.date || tx.created_at || '';
                    return (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-full',
                            tx.type === 'credit' 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                              : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                          )}>
                            {tx.type === 'credit' ? (
                              <ArrowDownCircle className="h-5 w-5" />
                            ) : (
                              <ArrowUpCircle className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{tx.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {tx.category && <span>{tx.category}</span>}
                              {tx.category && <span>•</span>}
                              <span>{new Date(txDate).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</span>
                              {tx.status === 'pending' && (
                                <>
                                  <span>•</span>
                                  <span className="text-orange-500">Pending</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            'font-semibold',
                            tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : ''
                          )}>
                            {tx.type === 'credit' ? '+' : '-'} UGX {tx.amount.toLocaleString()}
                          </p>
                          {tx.reference && (
                            <p className="text-xs text-muted-foreground">{tx.reference}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-muted-foreground mt-1">
                {searchQuery ? 'Try a different search term' : 'Your transaction history will appear here'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
