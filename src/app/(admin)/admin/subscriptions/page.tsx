'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import {
  Crown,
  Users,
  TrendingUp,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  UserCheck,
  UserX,
  BarChart3,
} from 'lucide-react';
import { cn, getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

interface SubscriptionStats {
  total_active: number;
  total_cancelled: number;
  total_expired: number;
  revenue_this_month: number;
  revenue_last_month: number;
  new_subscriptions_this_month: number;
  churn_rate: number;
  by_plan: Record<string, number>;
}

interface AdminSubscription {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
  };
  plan: {
    id: number;
    name: string;
    slug: string;
    tier: string;
  };
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  amount_paid: number;
  currency: string;
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  cancelled_at: string | null;
  created_at: string;
}

interface SubscriptionsListResponse {
  data: AdminSubscription[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  price_local: number;
  currency_local: string;
  billing_cycle: string;
  is_active: boolean;
  is_popular: boolean;
  features: string[];
}

// ============================================================================
// Status helpers
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  active:    { label: 'Active',    className: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: CheckCircle },
  trial:     { label: 'Trial',     className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',   icon: Clock },
  cancelled: { label: 'Cancelled', className: 'bg-orange-500/10 text-orange-500',                  icon: XCircle },
  expired:   { label: 'Expired',   className: 'bg-red-500/10 text-red-500',                        icon: AlertTriangle },
};

// ============================================================================
// Main page
// ============================================================================

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'subscribers' | 'plans'>('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', 'stats'],
    queryFn: () => apiGet<{ data: SubscriptionStats }>('/admin/subscriptions/stats'),
  });

  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', 'list', { page, search, statusFilter, planFilter }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '15');
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (planFilter !== 'all') params.set('plan', planFilter);
      return apiGet<SubscriptionsListResponse>(`/admin/subscriptions?${params.toString()}`);
    },
    enabled: activeTab === 'subscribers',
  });

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['admin', 'subscription-plans'],
    queryFn: () => apiGet<{ data: SubscriptionPlan[] }>('/admin/subscription-plans'),
    enabled: activeTab === 'plans',
  });

  const revokeMutation = useMutation({
    mutationFn: (subscriptionId: number) =>
      apiPost<{ message: string }>(`/admin/subscriptions/${subscriptionId}/revoke`, {}),
    onSuccess: (data) => {
      toast.success(data.message || 'Subscription revoked');
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to revoke subscription')),
  });

  const grantMutation = useMutation({
    mutationFn: ({ userId, planId }: { userId: number; planId: number }) =>
      apiPost<{ message: string }>('/admin/subscriptions/grant', { user_id: userId, plan_id: planId }),
    onSuccess: (data) => {
      toast.success(data.message || 'Subscription granted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to grant subscription')),
  });

  const togglePlanMutation = useMutation({
    mutationFn: (planId: number) =>
      apiPost<{ message: string }>(`/admin/subscription-plans/${planId}/toggle`, {}),
    onSuccess: (data) => {
      toast.success(data.message || 'Plan updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription-plans'] });
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to update plan')),
  });

  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            Subscriptions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage user subscriptions, plans, and billing analytics.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))
          : [
              { label: 'Active Subscribers', value: stats?.total_active ?? 0, icon: Users, color: 'text-green-500' },
              { label: 'New This Month', value: stats?.new_subscriptions_this_month ?? 0, icon: TrendingUp, color: 'text-blue-500' },
              { label: 'Cancellations', value: stats?.total_cancelled ?? 0, icon: XCircle, color: 'text-orange-500' },
              {
                label: 'Revenue (month)',
                value: stats ? `UGX ${Number(stats.revenue_this_month).toLocaleString()}` : '—',
                icon: BarChart3,
                color: 'text-primary',
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn('h-4 w-4', color)} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            ))}
      </div>

      {/* By-plan breakdown */}
      {stats?.by_plan && Object.keys(stats.by_plan).length > 0 && (
        <div className="p-4 rounded-xl border bg-card">
          <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Active Subscribers by Plan</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.by_plan).map(([plan, count]) => (
              <div key={plan} className="flex items-center gap-2">
                <span className="capitalize font-medium">{plan}</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b gap-6">
        {(['overview', 'subscribers', 'plans'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'pb-3 text-sm font-medium border-b-2 transition-colors capitalize',
              activeTab === tab
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-card space-y-3">
              <h3 className="font-semibold">Revenue Comparison</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium text-green-500">
                  UGX {Number(stats?.revenue_this_month ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Month</span>
                <span className="font-medium">
                  UGX {Number(stats?.revenue_last_month ?? 0).toLocaleString()}
                </span>
              </div>
              {stats && stats.revenue_last_month > 0 && (
                <div className="text-xs text-muted-foreground">
                  {stats.revenue_this_month >= stats.revenue_last_month
                    ? <span className="text-green-500">↑ {(((stats.revenue_this_month - stats.revenue_last_month) / stats.revenue_last_month) * 100).toFixed(1)}% vs last month</span>
                    : <span className="text-red-500">↓ {(((stats.revenue_last_month - stats.revenue_this_month) / stats.revenue_last_month) * 100).toFixed(1)}% vs last month</span>
                  }
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border bg-card space-y-3">
              <h3 className="font-semibold">Subscriber Health</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <span className="text-green-500 font-medium">{stats?.total_active ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cancelled</span>
                <span className="text-orange-500 font-medium">{stats?.total_cancelled ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expired</span>
                <span className="text-red-500 font-medium">{stats?.total_expired ?? 0}</span>
              </div>
              {typeof stats?.churn_rate === 'number' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Churn Rate</span>
                  <span className="font-medium">{stats.churn_rate.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('subscribers')}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              View All Subscribers
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted"
            >
              Manage Plans
            </button>
          </div>
        </div>
      )}

      {/* Tab: Subscribers */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="all">All Plans</option>
              <option value="premium">Premium</option>
              <option value="artist">Artist</option>
              <option value="label">Label</option>
            </select>
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expires</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-8 bg-muted rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : !subsData?.data?.length ? (
                  <tr className="border-t">
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No subscriptions found.
                    </td>
                  </tr>
                ) : (
                  subsData.data.map((sub) => {
                    const statusCfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.expired;
                    const StatusIcon = statusCfg.icon;
                    return (
                      <tr key={sub.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{sub.user.name}</p>
                            <p className="text-xs text-muted-foreground">{sub.user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize font-medium">{sub.plan.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', statusCfg.className)}>
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(sub.expires_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {sub.amount_paid === 0
                            ? <span className="text-muted-foreground">Free</span>
                            : <span>{sub.currency} {Number(sub.amount_paid).toLocaleString()}</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {sub.status === 'active' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Revoke ${sub.user.name}'s subscription?`)) {
                                    revokeMutation.mutate(sub.id);
                                  }
                                }}
                                disabled={revokeMutation.isPending}
                                className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                                title="Revoke subscription"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            )}
                            {(sub.status === 'expired' || sub.status === 'cancelled') && (
                              <button
                                onClick={() => grantMutation.mutate({ userId: sub.user.id, planId: sub.plan.id })}
                                disabled={grantMutation.isPending}
                                className="p-1.5 rounded hover:bg-green-500/10 text-green-500 transition-colors"
                                title="Re-grant subscription"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {subsData?.meta && subsData.meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {subsData.meta.total} total · page {subsData.meta.current_page} of {subsData.meta.last_page}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-lg border hover:bg-muted disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= subsData.meta.last_page}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg border hover:bg-muted disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Plans */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          {plansLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !plansData?.data?.length ? (
            <p className="text-muted-foreground text-sm">No plans found.</p>
          ) : (
            <div className="space-y-3">
              {plansData.data.map((plan) => (
                <div key={plan.id} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {plan.is_popular && (
                        <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded font-medium">Popular</span>
                      )}
                      <span
                        className={cn(
                          'px-1.5 py-0.5 text-xs rounded font-medium',
                          plan.is_active
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {plan.price_local > 0
                        ? `${plan.currency_local} ${Number(plan.price_local).toLocaleString()} / ${plan.billing_cycle}`
                        : 'Free'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => togglePlanMutation.mutate(plan.id)}
                      disabled={togglePlanMutation.isPending}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors',
                        plan.is_active
                          ? 'text-orange-500 border-orange-500/20 hover:bg-orange-500/10'
                          : 'text-green-500 border-green-500/20 hover:bg-green-500/10'
                      )}
                    >
                      {togglePlanMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        plan.is_active ? 'Deactivate' : 'Activate'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
