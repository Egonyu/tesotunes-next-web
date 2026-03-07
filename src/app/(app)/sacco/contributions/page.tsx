'use client';

import { useState } from 'react';
import { Receipt, CheckCircle2, Clock, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSaccoContributions } from '@/hooks/useSacco';
import { cn } from '@/lib/utils';

const statusConfig = {
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' },
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
};

export default function ContributionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSaccoContributions({ page, per_page: 20 });

  const contributions = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contributions</h1>
        <p className="text-muted-foreground mt-1">Your contribution history to the SACCO</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : contributions.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-card">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-lg font-medium">No contributions yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your contribution history will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Method</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Reference</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contributions.map((c) => {
                const status = statusConfig[c.status] ?? statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      {new Date(c.contribution_date).toLocaleDateString('en-UG', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      UGX {c.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell capitalize">
                      {c.payment_method.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs hidden md:table-cell">
                      {c.reference ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">{total} total contributions</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded hover:bg-muted disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded hover:bg-muted disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
