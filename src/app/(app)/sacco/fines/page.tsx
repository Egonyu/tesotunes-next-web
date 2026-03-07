'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useSaccoFines, usePaySaccoFine, SaccoFine } from '@/hooks/useSacco';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusConfig: Record<SaccoFine['status'], { label: string; icon: React.ElementType; color: string }> = {
  pending:  { label: 'Pending',  icon: Clock,         color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' },
  overdue:  { label: 'Overdue',  icon: AlertCircle,   color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
  paid:     { label: 'Paid',     icon: CheckCircle2,  color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' },
  waived:   { label: 'Waived',   icon: CheckCircle2,  color: 'text-muted-foreground bg-muted' },
};

const tabs = [
  { label: 'Outstanding', value: 'pending' },
  { label: 'Overdue',     value: 'overdue' },
  { label: 'Settled',     value: 'paid' },
];

export default function SaccoFinesPage() {
  const [tab, setTab] = useState<string>('pending');
  const [payingId, setPayingId] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');

  const { data: fines = [], isLoading } = useSaccoFines({ status: tab });
  const payFine = usePaySaccoFine();

  function handlePay(fine: SaccoFine) {
    if (!phone.trim()) return toast.error('Enter your phone number');
    payFine.mutate(
      { fine_id: fine.id, phone_number: phone, payment_method: method },
      {
        onSuccess: () => {
          toast.success('Payment initiated. Check your phone.');
          setPayingId(null);
          setPhone('');
        },
        onError: () => toast.error('Payment failed. Please try again.'),
      }
    );
  }

  const outstanding = fines.filter((f) => f.status !== 'paid' && f.status !== 'waived');
  const totalOwed = outstanding.reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Fines</h1>
          <p className="text-muted-foreground mt-1">Outstanding fines and payment history</p>
        </div>
        {totalOwed > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm font-semibold">UGX {totalOwed.toLocaleString()} outstanding</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : fines.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-card">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-emerald-500 opacity-60" />
          <p className="text-lg font-medium">No {tab === 'paid' ? 'settled' : 'outstanding'} fines</p>
          <p className="text-sm text-muted-foreground mt-1">You&apos;re all good!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fines.map((fine) => {
            const cfg = statusConfig[fine.status];
            const StatusIcon = cfg.icon;
            const isExpanded = payingId === fine.id;
            const canPay = fine.status === 'pending' || fine.status === 'overdue';

            return (
              <div key={fine.id} className="rounded-xl border bg-card overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="font-medium">{fine.reason}</p>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0', cfg.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground mt-1">
                      <span>UGX {fine.amount.toLocaleString()}</span>
                      <span>Issued {new Date(fine.issued_date).toLocaleDateString('en-UG')}</span>
                      {fine.status !== 'paid' && fine.status !== 'waived' && (
                        <span className={fine.status === 'overdue' ? 'text-red-500 font-medium' : ''}>
                          Due {new Date(fine.due_date).toLocaleDateString('en-UG')}
                        </span>
                      )}
                    </div>
                  </div>

                  {canPay && (
                    <button
                      onClick={() => setPayingId(isExpanded ? null : fine.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shrink-0"
                    >
                      Pay Now
                    </button>
                  )}
                </div>

                {/* Inline payment form */}
                {isExpanded && canPay && (
                  <div className="border-t px-4 py-4 bg-muted/30 space-y-3">
                    <p className="text-sm font-medium">Pay UGX {fine.amount.toLocaleString()} via Mobile Money</p>
                    <div className="flex gap-2">
                      {(['mtn_momo', 'airtel_money'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMethod(m)}
                          className={cn(
                            'flex-1 py-2 rounded-lg border text-sm font-medium transition-colors',
                            method === m ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
                          )}
                        >
                          {m === 'mtn_momo' ? 'MTN MoMo' : 'Airtel Money'}
                        </button>
                      ))}
                    </div>
                    <input
                      type="tel"
                      placeholder="07xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePay(fine)}
                        disabled={payFine.isPending}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                      >
                        {payFine.isPending ? 'Processing…' : 'Confirm Payment'}
                      </button>
                      <button
                        onClick={() => setPayingId(null)}
                        className="px-4 py-2 rounded-lg border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
