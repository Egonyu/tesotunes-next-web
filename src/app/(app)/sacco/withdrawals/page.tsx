'use client';

import { useState } from 'react';
import {
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  XCircle,
  Banknote,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import { useSaccoWithdrawalRequests, useCreateWithdrawalRequest, SaccoWithdrawalRequest } from '@/hooks/useSacco';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusConfig: Record<SaccoWithdrawalRequest['status'], { label: string; icon: React.ElementType; color: string }> = {
  pending:   { label: 'Pending',    icon: Clock,          color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' },
  approved:  { label: 'Approved',   icon: CheckCircle2,   color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  disbursed: { label: 'Disbursed',  icon: Banknote,       color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' },
  rejected:  { label: 'Rejected',   icon: XCircle,        color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
};

const tabs = [
  { label: 'Pending',   value: 'pending' },
  { label: 'Approved',  value: 'approved' },
  { label: 'Disbursed', value: 'disbursed' },
  { label: 'All',       value: '' },
];

export default function SaccoWithdrawalsPage() {
  const [tab, setTab] = useState<string>('pending');
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');

  const { data: requests = [], isLoading } = useSaccoWithdrawalRequests(tab ? { status: tab } : {});
  const createRequest = useCreateWithdrawalRequest();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return toast.error('Enter a valid amount');
    if (!phone.trim()) return toast.error('Enter your phone number');

    createRequest.mutate(
      { amount: parsedAmount, reason: reason || undefined, phone_number: phone, payment_method: method },
      {
        onSuccess: () => {
          toast.success('Withdrawal request submitted');
          setShowForm(false);
          setAmount('');
          setReason('');
          setPhone('');
        },
        onError: () => toast.error('Failed to submit request. Try again.'),
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
          <p className="text-muted-foreground mt-1">Request withdrawals from your SACCO savings</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
        >
          {showForm ? <><X className="h-4 w-4" />Cancel</> : <><Plus className="h-4 w-4" />New Request</>}
        </button>
      </div>

      {/* New request form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold">New Withdrawal Request</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Amount (UGX)</label>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
              <input
                type="tel"
                placeholder="07xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Payment Method</label>
            <div className="flex gap-2">
              {(['mtn_momo', 'airtel_money'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border text-sm font-medium transition-colors',
                    method === m
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m === 'mtn_momo' ? 'MTN MoMo' : 'Airtel Money'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Reason <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              rows={2}
              placeholder="e.g. school fees, medical emergency…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={createRequest.isPending}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {createRequest.isPending ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
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
      ) : requests.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-card">
          <ArrowUpFromLine className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-lg font-medium">No requests</p>
          <p className="text-sm text-muted-foreground mt-1">Your withdrawal requests will show here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const cfg = statusConfig[req.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={req.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold">UGX {req.amount.toLocaleString()}</p>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0', cfg.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground mt-1">
                      <span>via {req.payment_method === 'mtn_momo' ? 'MTN MoMo' : 'Airtel Money'} · {req.phone_number}</span>
                      <span>Requested {new Date(req.requested_at).toLocaleDateString('en-UG')}</span>
                      {req.reviewed_at && (
                        <span>Reviewed {new Date(req.reviewed_at).toLocaleDateString('en-UG')}</span>
                      )}
                    </div>
                    {req.reason && (
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">{req.reason}</p>
                    )}
                    {req.status === 'rejected' && req.rejection_reason && (
                      <p className="text-xs text-red-500 mt-1">Reason: {req.rejection_reason}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
