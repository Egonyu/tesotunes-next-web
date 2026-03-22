'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Wallet,
  XCircle,
} from 'lucide-react';

interface DashboardSummary {
  total: number;
  completed: number;
  processing: number;
  pending: number;
  failed: number;
  cancelled: number;
  refunded: number;
  reversed: number;
  open_issues: number;
  complaints: number;
  invalid_webhook_signatures: number;
  missing_provider_reference: number;
  completed_amount: number;
  failed_amount: number;
}

interface DashboardAlert {
  id: number;
  issue_type: string;
  title: string;
  status: string;
  severity: string;
  created_at: string | null;
  payment: {
    id: number;
    payment_type: string;
    status: string;
    amount: number;
    payment_reference: string;
  } | null;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface DashboardData {
  summary: DashboardSummary;
  recent_alerts: DashboardAlert[];
  generated_at: string;
}

interface PaymentRow {
  id: number;
  uuid: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  payment_type: string;
  payment_method: string | null;
  provider: string | null;
  status: string;
  amount: number;
  currency: string;
  phone_number: string | null;
  payment_reference: string | null;
  transaction_reference: string | null;
  provider_transaction_id: string | null;
  provider_reference: string | null;
  failure_reason: string | null;
  created_at: string | null;
  initiated_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  processing_age_minutes: number | null;
  issue_count: number;
  latest_issue: {
    id: number;
    issue_type: string;
    title: string;
    status: string;
    severity: string;
  } | null;
}

interface IssueRow {
  id: number;
  payment_id: number;
  issue_type: string;
  title: string;
  description: string | null;
  status: string;
  severity: string;
  money_deducted: boolean;
  service_delivered: boolean;
  provider_status: string | null;
  created_at: string | null;
  payment: {
    id: number;
    payment_type: string;
    status: string;
    amount: number;
    payment_reference: string;
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
  } | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface EntryPoint {
  key: string;
  label: string;
  initiation_endpoints: string[];
  status_endpoints: string[];
  webhook_endpoints: string[];
  integration_mode: string;
  observability: string;
  known_gap: string | null;
  notes: string;
  success_rate: number | null;
  metrics: {
    total: number;
    completed: number;
    failed: number;
    in_flight: number;
    open_issues: number;
    total_issues: number;
  };
}

const money = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

function formatMoney(amount: number, currency = 'UGX') {
  return `${currency} ${money.format(amount || 0)}`;
}

function formatDate(value: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFlowMinutes(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  const normalized = Math.max(0, Math.round(value));

  return `${normalized} min in flow`;
}

function StatCard({
  label,
  value,
  tone = 'default',
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  detail?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const toneClass = {
    default: 'border-border/70 bg-gradient-to-br from-background via-background to-muted/40 text-foreground',
    success: 'border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-background to-emerald-100/70 text-emerald-950 dark:border-emerald-900/70 dark:from-emerald-950/60 dark:via-background dark:to-emerald-900/30 dark:text-emerald-100',
    warning: 'border-amber-200/70 bg-gradient-to-br from-amber-50 via-background to-amber-100/70 text-amber-950 dark:border-amber-900/70 dark:from-amber-950/50 dark:via-background dark:to-amber-900/30 dark:text-amber-100',
    danger: 'border-rose-200/70 bg-gradient-to-br from-rose-50 via-background to-rose-100/70 text-rose-950 dark:border-rose-900/70 dark:from-rose-950/50 dark:via-background dark:to-rose-900/30 dark:text-rose-100',
  }[tone];

  return (
    <div className={cn('rounded-2xl border p-5 shadow-sm shadow-black/5', toneClass)}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <Icon className="h-5 w-5 opacity-70" />
      </div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      {detail ? <p className="mt-2 text-sm text-muted-foreground dark:text-current/75">{detail}</p> : null}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const paymentParams = useMemo(() => ({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: deferredSearch || undefined,
    per_page: 14,
  }), [deferredSearch, statusFilter]);

  const issuesParams = useMemo(() => ({
    unresolved: true,
    per_page: 10,
  }), []);

  const dashboardQuery = useQuery({
    queryKey: ['admin', 'payments', 'dashboard'],
    queryFn: () => apiGet<{ data: DashboardData }>('/admin/payments/observability').then((res) => res.data),
    refetchInterval: 30000,
  });

  const paymentsQuery = useQuery({
    queryKey: ['admin', 'payments', 'list', paymentParams],
    queryFn: () => apiGet<{ data: PaymentRow[]; meta: PaginationMeta }>('/admin/payments', { params: paymentParams }),
    refetchInterval: 20000,
  });

  const issuesQuery = useQuery({
    queryKey: ['admin', 'payments', 'issues', issuesParams],
    queryFn: () => apiGet<{ data: IssueRow[]; meta: PaginationMeta }>('/admin/payment-issues', { params: issuesParams }),
    refetchInterval: 30000,
  });

  const entryPointsQuery = useQuery({
    queryKey: ['admin', 'payments', 'entry-points'],
    queryFn: () => apiGet<{ data: EntryPoint[] }>('/admin/payments/entry-points').then((res) => res.data),
    staleTime: 60000,
  });

  const summary = dashboardQuery.data?.summary;
  const alerts = dashboardQuery.data?.recent_alerts ?? [];
  const payments = paymentsQuery.data?.data ?? [];
  const paymentMeta = paymentsQuery.data?.meta;
  const issues = issuesQuery.data?.data ?? [];
  const entryPoints = entryPointsQuery.data ?? [];

  const isLoading = dashboardQuery.isLoading || paymentsQuery.isLoading || issuesQuery.isLoading || entryPointsQuery.isLoading;
  const isRefreshing = dashboardQuery.isFetching || paymentsQuery.isFetching || issuesQuery.isFetching || entryPointsQuery.isFetching;

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Payments Command Center</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Operational visibility for ZengaPay and platform payment flows</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Watch successful, failed, pending, reversed, and structurally risky flows in one place. This page also maps which payment entry points are fully on the shared ledger and which ones still bypass it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void dashboardQuery.refetch();
            void paymentsQuery.refetch();
            void issuesQuery.refetch();
            void entryPointsQuery.refetch();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm shadow-black/5 transition-colors hover:bg-muted"
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Completed"
          value={String(summary?.completed ?? 0)}
          detail={formatMoney(summary?.completed_amount ?? 0)}
          tone="success"
          icon={CheckCircle2}
        />
        <StatCard
          label="In Flight"
          value={String((summary?.processing ?? 0) + (summary?.pending ?? 0))}
          detail={`${summary?.processing ?? 0} processing • ${summary?.pending ?? 0} pending`}
          tone="warning"
          icon={Clock3}
        />
        <StatCard
          label="Failures"
          value={String((summary?.failed ?? 0) + (summary?.reversed ?? 0))}
          detail={`${formatMoney(summary?.failed_amount ?? 0)} exposed`}
          tone="danger"
          icon={XCircle}
        />
        <StatCard
          label="Open Issues"
          value={String(summary?.open_issues ?? 0)}
          detail={`${summary?.invalid_webhook_signatures ?? 0} signature faults • ${summary?.missing_provider_reference ?? 0} missing provider refs`}
          tone="default"
          icon={ShieldAlert}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <section className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm shadow-black/5 backdrop-blur-sm">
          <div className="flex flex-col gap-4 border-b border-border/70 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Payment Stream</h2>
              <p className="text-sm text-muted-foreground">
                {paymentMeta ? `${paymentMeta.total.toLocaleString()} payments tracked in the ledger` : 'Live payment rows'}
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search user, phone, or reference"
                  className="w-full rounded-xl border border-border/70 bg-background/80 py-2 pl-10 pr-4 text-sm text-foreground shadow-sm shadow-black/5 outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-border/70 bg-background/80 px-4 py-2 text-sm text-foreground shadow-sm shadow-black/5 outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              >
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Customer / Flow</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">References</th>
                  <th className="pb-3 font-medium">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No payments matched the current filters.
                    </td>
                  </tr>
                ) : payments.map((payment) => (
                  <tr key={payment.id} className="align-top transition-colors hover:bg-muted/35">
                    <td className="py-4 pr-4">
                      <div className="font-medium">{payment.user?.name ?? 'Unknown user'}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{payment.user?.email ?? payment.phone_number ?? 'No contact captured'}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <StatusBadge status={payment.payment_type} size="sm" />
                        {payment.provider ? <StatusBadge status={payment.provider} size="sm" variant="info" /> : null}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-semibold">{formatMoney(payment.amount, payment.currency)}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{payment.payment_method ?? 'n/a'}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={payment.status} />
                      {payment.latest_issue ? (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2 py-1 text-[11px] font-medium text-amber-900 dark:bg-amber-950/70 dark:text-amber-200">
                          <AlertTriangle className="h-3 w-3" />
                          {payment.latest_issue.issue_type.replace(/_/g, ' ')}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-mono text-xs">{payment.payment_reference ?? '—'}</div>
                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                        {payment.provider_transaction_id ?? payment.transaction_reference ?? 'No provider ref yet'}
                      </div>
                    </td>
                    <td className="py-4">
                      <div>{formatDate(payment.created_at)}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {(() => {
                          const flowMinutes = formatFlowMinutes(payment.processing_age_minutes);

                          if (payment.completed_at) {
                            return `Completed ${formatDate(payment.completed_at)}`;
                          }

                          if (payment.failed_at) {
                            return `Failed ${formatDate(payment.failed_at)}`;
                          }

                          if (flowMinutes) {
                            return flowMinutes;
                          }

                          return 'Awaiting confirmation';
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm shadow-black/5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Issue Queue</h2>
                <p className="text-sm text-muted-foreground">Payments that need investigation first</p>
              </div>
              <div className="rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950/70 dark:text-amber-200">
                {issues.length} visible
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {issues.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                  No open payment issues right now.
                </div>
              ) : issues.map((issue) => (
                <div key={issue.id} className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm shadow-black/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{issue.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {issue.payment?.user?.name ?? 'Unknown user'} • {issue.payment?.payment_reference ?? `Payment #${issue.payment_id}`}
                      </p>
                    </div>
                    <StatusBadge status={issue.severity} size="sm" variant={issue.severity === 'critical' ? 'error' : issue.severity === 'high' ? 'warning' : 'default'} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{issue.description ?? 'No extra description captured.'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={issue.issue_type} size="sm" />
                    <StatusBadge status={issue.status} size="sm" variant={issue.status === 'resolved' ? 'success' : issue.status === 'escalated' ? 'error' : 'warning'} />
                    {issue.provider_status ? <StatusBadge status={issue.provider_status} size="sm" variant="info" /> : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50 via-cyan-50 to-background p-6 text-slate-900 shadow-sm shadow-black/5 dark:border-sky-900/60 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950/70 dark:text-slate-50">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              <div>
                <h2 className="text-lg font-semibold">Live Alerts</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Most recent operational warnings in the payment layer</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-2xl border border-sky-200/70 bg-white/70 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  No active payment alerts.
                </div>
              ) : alerts.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-sky-200/70 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{alert.payment?.payment_reference ?? 'No payment reference'} • {formatDate(alert.created_at)}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{alert.user?.name ?? 'Unknown user'} • {alert.issue_type.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm shadow-black/5 backdrop-blur-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Payment Entry-Point Map</h2>
            <p className="text-sm text-muted-foreground">
              This is the architecture view: which endpoints are fully observable and which ones still bypass the shared ledger.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Updated {formatDate(dashboardQuery.data?.generated_at ?? null)}
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {entryPoints.map((entryPoint) => (
            <div key={entryPoint.key} className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm shadow-black/5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{entryPoint.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{entryPoint.notes}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={entryPoint.integration_mode} size="sm" variant="info" />
                  <StatusBadge
                    status={entryPoint.observability}
                    size="sm"
                    variant={entryPoint.observability === 'full' ? 'success' : entryPoint.observability === 'partial' ? 'warning' : 'error'}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Tracked</p>
                  <p className="mt-2 text-2xl font-semibold">{entryPoint.metrics.total}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/80 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">Completed</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">{entryPoint.metrics.completed}</p>
                </div>
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/80 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">In Flight</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-100">{entryPoint.metrics.in_flight}</p>
                </div>
                <div className="rounded-2xl border border-rose-200/60 bg-rose-50/80 p-3 dark:border-rose-900/60 dark:bg-rose-950/30">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-rose-700 dark:text-rose-300">Open Issues</p>
                  <p className="mt-2 text-2xl font-semibold text-rose-900 dark:text-rose-100">{entryPoint.metrics.open_issues}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Initiate</p>
                  <div className="mt-2 space-y-2">
                    {entryPoint.initiation_endpoints.map((endpoint) => (
                      <code key={endpoint} className="block rounded-xl border border-border/70 bg-muted/45 px-3 py-2 text-xs text-foreground">
                        {endpoint}
                      </code>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                  <div className="mt-2 space-y-2">
                    {entryPoint.status_endpoints.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">No shared status endpoint</div>
                    ) : entryPoint.status_endpoints.map((endpoint) => (
                      <code key={endpoint} className="block rounded-xl border border-border/70 bg-muted/45 px-3 py-2 text-xs text-foreground">
                        {endpoint}
                      </code>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Webhook</p>
                  <div className="mt-2 space-y-2">
                    {entryPoint.webhook_endpoints.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">No webhook coverage</div>
                    ) : entryPoint.webhook_endpoints.map((endpoint) => (
                      <code key={endpoint} className="block rounded-xl border border-border/70 bg-muted/45 px-3 py-2 text-xs text-foreground">
                        {endpoint}
                      </code>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Success rate: {entryPoint.success_rate === null ? 'n/a' : `${entryPoint.success_rate}%`}
                </div>
                {entryPoint.known_gap ? (
                  <div className="rounded-full bg-rose-100/80 px-3 py-1 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-200">
                    Known gap: {entryPoint.known_gap}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
