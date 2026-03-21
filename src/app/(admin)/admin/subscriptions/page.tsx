'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  UserCheck,
  UserX,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { cn, getErrorMessage } from '@/lib/utils';

interface SubscriptionStats {
  total_active: number;
  total_cancelled: number;
  total_expired: number;
  revenue_this_month: number;
  by_plan: Record<string, number>;
}

interface StatsApiResponse {
  data?: {
    active?: number;
    expired?: number;
    cancelled?: number;
    mrr?: number;
    plan_distribution?: Array<{ name: string; count: number }>;
  };
}

interface AdminSubscription {
  id: number;
  user: { id: number; name: string; email: string } | null;
  plan: { id: number; name: string; slug: string; tier: string } | null;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  amount_paid: number;
  currency: string;
  expires_at: string;
}

interface SubscriptionsApiResponse {
  data?: { records?: AdminSubscription[] };
  legacy_data?: AdminSubscription[];
  meta?: { total: number; per_page: number; current_page: number; last_page: number };
}

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  tier: string;
  type?: string;
  description?: string | null;
  currency?: string | null;
  interval?: string | null;
  interval_count?: number | null;
  region?: string | null;
  price?: number;
  price_monthly?: number;
  price_yearly?: number;
  price_local?: number;
  duration_days?: number;
  trial_days?: number;
  features: string[];
  max_downloads_per_day?: number | null;
  max_uploads_per_month?: number | null;
  max_audio_quality_kbps?: number;
  has_ads?: boolean;
  offline_mode?: boolean;
  is_active: boolean;
  is_visible?: boolean;
  is_featured?: boolean;
  is_popular: boolean;
  sort_order?: number;
  rates?: {
    stream_rate_ugx?: string | number | null;
    credit_to_ugx_rate?: string | number | null;
    effective?: { effective_stream_rate_ugx?: string | number | null };
  };
}

interface SubscriptionPlansResponse {
  data?: { records?: SubscriptionPlan[] };
  legacy_data?: SubscriptionPlan[];
}

interface GrantFormState {
  userId: string;
  planId: string;
  days: string;
  reason: string;
}

interface PlanFormState {
  name: string;
  slug: string;
  description: string;
  tier: string;
  type: string;
  currency: string;
  interval: string;
  intervalCount: string;
  region: string;
  priceMonthly: string;
  priceYearly: string;
  priceLocal: string;
  trialDays: string;
  durationDays: string;
  maxDownloadsPerDay: string;
  maxUploadsPerMonth: string;
  maxAudioQualityKbps: string;
  streamRateUgx: string;
  creditToUgxRate: string;
  sortOrder: string;
  features: string;
  hasAds: boolean;
  offlineMode: boolean;
  isActive: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  isPopular: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', className: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: CheckCircle },
  trial: { label: 'Trial', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Clock },
  cancelled: { label: 'Cancelled', className: 'bg-orange-500/10 text-orange-500', icon: XCircle },
  expired: { label: 'Expired', className: 'bg-red-500/10 text-red-500', icon: AlertTriangle },
};

const defaultGrantForm = (): GrantFormState => ({ userId: '', planId: '', days: '30', reason: '' });
const defaultPlanForm = (): PlanFormState => ({
  name: '',
  slug: '',
  description: '',
  tier: 'premium',
  type: 'standard',
  currency: 'UGX',
  interval: 'month',
  intervalCount: '1',
  region: 'EA',
  priceMonthly: '0',
  priceYearly: '0',
  priceLocal: '0',
  trialDays: '0',
  durationDays: '30',
  maxDownloadsPerDay: '',
  maxUploadsPerMonth: '0',
  maxAudioQualityKbps: '320',
  streamRateUgx: '',
  creditToUgxRate: '',
  sortOrder: '0',
  features: '',
  hasAds: false,
  offlineMode: true,
  isActive: true,
  isVisible: true,
  isFeatured: false,
  isPopular: false,
});

const asString = (value: string | number | null | undefined, fallback = '') =>
  value === null || value === undefined ? fallback : String(value);
const toNumber = (value: string) => Number(value || 0);
const toNullableNumber = (value: string) => (value.trim() === '' ? null : Number(value));

const normalizeStatsResponse = (response: StatsApiResponse): SubscriptionStats => ({
  total_active: response?.data?.active ?? 0,
  total_cancelled: response?.data?.cancelled ?? 0,
  total_expired: response?.data?.expired ?? 0,
  revenue_this_month: Number(response?.data?.mrr ?? 0),
  by_plan: Object.fromEntries((response?.data?.plan_distribution ?? []).map((entry) => [entry.name, entry.count])),
});

const normalizePlansResponse = (response: SubscriptionPlansResponse) =>
  Array.isArray(response?.data?.records) ? response.data.records : Array.isArray(response?.legacy_data) ? response.legacy_data : [];

const normalizeSubscriptionsResponse = (response: SubscriptionsApiResponse) => ({
  data: Array.isArray(response?.data?.records) ? response.data.records : Array.isArray(response?.legacy_data) ? response.legacy_data : [],
  meta: response?.meta,
});

const buildPlanForm = (plan: SubscriptionPlan): PlanFormState => ({
  name: plan.name ?? '',
  slug: plan.slug ?? '',
  description: plan.description ?? '',
  tier: plan.tier ?? 'premium',
  type: plan.type ?? 'standard',
  currency: plan.currency ?? 'UGX',
  interval: plan.interval ?? 'month',
  intervalCount: asString(plan.interval_count ?? 1, '1'),
  region: plan.region ?? 'EA',
  priceMonthly: asString(plan.price_monthly ?? plan.price ?? 0, '0'),
  priceYearly: asString(plan.price_yearly ?? 0, '0'),
  priceLocal: asString(plan.price_local ?? 0, '0'),
  trialDays: asString(plan.trial_days ?? 0, '0'),
  durationDays: asString(plan.duration_days ?? 30, '30'),
  maxDownloadsPerDay: asString(plan.max_downloads_per_day),
  maxUploadsPerMonth: asString(plan.max_uploads_per_month ?? 0, '0'),
  maxAudioQualityKbps: asString(plan.max_audio_quality_kbps ?? 320, '320'),
  streamRateUgx: asString(plan.rates?.stream_rate_ugx),
  creditToUgxRate: asString(plan.rates?.credit_to_ugx_rate),
  sortOrder: asString(plan.sort_order ?? 0, '0'),
  features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
  hasAds: Boolean(plan.has_ads),
  offlineMode: Boolean(plan.offline_mode),
  isActive: Boolean(plan.is_active),
  isVisible: plan.is_visible ?? true,
  isFeatured: Boolean(plan.is_featured),
  isPopular: Boolean(plan.is_popular),
});

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'subscribers' | 'plans'>('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState<GrantFormState>(defaultGrantForm);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState<PlanFormState>(defaultPlanForm);
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', 'stats'],
    queryFn: () => apiGet<StatsApiResponse>('/admin/subscriptions/stats').then(normalizeStatsResponse),
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['admin', 'subscription-plans'],
    queryFn: () => apiGet<SubscriptionPlansResponse>('/admin/subscription-plans').then(normalizePlansResponse),
  });

  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', 'list', { page, search, statusFilter, planFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '15');
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (planFilter !== 'all') params.set('plan_id', planFilter);
      return apiGet<SubscriptionsApiResponse>(`/admin/subscriptions?${params.toString()}`).then(normalizeSubscriptionsResponse);
    },
    enabled: activeTab === 'subscribers',
  });

  const selectedGrantPlan = useMemo(
    () => plans.find((plan) => String(plan.id) === grantForm.planId) ?? null,
    [grantForm.planId, plans]
  );

  const revokeMutation = useMutation({
    mutationFn: ({ subscriptionId, reason }: { subscriptionId: number; reason: string }) =>
      apiPost<{ message: string }>(`/admin/subscriptions/${subscriptionId}/revoke`, { reason }),
    onSuccess: (data) => {
      toast.success(data.message || 'Subscription revoked');
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', 'stats'] });
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to revoke subscription')),
  });

  const grantMutation = useMutation({
    mutationFn: (payload: { userId: number; planId: number; days: number; reason: string }) =>
      apiPost<{ message: string }>('/admin/subscriptions/grant', {
        user_id: payload.userId,
        plan_id: payload.planId,
        days: payload.days,
        reason: payload.reason,
      }),
    onSuccess: (data) => {
      toast.success(data.message || 'Subscription granted');
      setShowGrantModal(false);
      setGrantForm(defaultGrantForm());
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', 'stats'] });
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to grant subscription')),
  });

  const savePlanMutation = useMutation({
    mutationFn: ({ planId, payload }: { planId?: number; payload: Record<string, unknown> }) =>
      planId
        ? apiPut<{ message: string }>(`/admin/subscription-plans/${planId}`, payload)
        : apiPost<{ message: string }>('/admin/subscription-plans', payload),
    onSuccess: (data) => {
      toast.success(data.message || (editingPlan ? 'Plan updated' : 'Plan created'));
      closePlanModal();
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription-plans'] });
    },
    onError: (error) => toast.error(getErrorMessage(error, editingPlan ? 'Failed to update plan' : 'Failed to create plan')),
  });

  const closeGrantModal = () => {
    if (!grantMutation.isPending) {
      setShowGrantModal(false);
      setGrantForm(defaultGrantForm());
    }
  };

  const closePlanModal = () => {
    if (!savePlanMutation.isPending) {
      setEditingPlan(null);
      setShowPlanModal(false);
      setPlanForm(defaultPlanForm());
    }
  };

  const openPlanEditor = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm(buildPlanForm(plan));
    setShowPlanModal(true);
  };

  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm(defaultPlanForm());
    setShowPlanModal(true);
  };

  const submitGrant = () => {
    const userId = Number(grantForm.userId);
    const planId = Number(grantForm.planId);
    const days = Number(grantForm.days);

    if (!userId || !planId || !days || !grantForm.reason.trim()) {
      toast.error('User ID, plan, duration, and reason are required.');
      return;
    }

    grantMutation.mutate({ userId, planId, days, reason: grantForm.reason.trim() });
  };

  const submitPlan = () => {
    const features = planForm.features
      .split(/\r?\n|,/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (!planForm.name.trim() || !planForm.description.trim()) {
      toast.error('Name and description are required.');
      return;
    }

    if (!features.length) {
      toast.error('Add at least one visible value point for the package.');
      return;
    }

    savePlanMutation.mutate({
      planId: editingPlan?.id,
      payload: {
        name: planForm.name.trim(),
        slug: planForm.slug.trim() || undefined,
        description: planForm.description.trim(),
        tier: planForm.tier.trim(),
        type: planForm.type.trim(),
        currency: planForm.currency.trim().toUpperCase(),
        interval: planForm.interval.trim(),
        interval_count: toNumber(planForm.intervalCount),
        region: planForm.region.trim() || null,
        price_monthly: toNumber(planForm.priceMonthly),
        price_yearly: toNumber(planForm.priceYearly),
        price_local: toNumber(planForm.priceLocal),
        trial_days: toNumber(planForm.trialDays),
        duration_days: toNumber(planForm.durationDays),
        max_downloads_per_day: toNullableNumber(planForm.maxDownloadsPerDay),
        max_uploads_per_month: toNullableNumber(planForm.maxUploadsPerMonth),
        max_audio_quality_kbps: toNumber(planForm.maxAudioQualityKbps),
        has_ads: planForm.hasAds,
        offline_mode: planForm.offlineMode,
        is_active: planForm.isActive,
        is_visible: planForm.isVisible,
        is_featured: planForm.isFeatured,
        is_popular: planForm.isPopular,
        sort_order: toNumber(planForm.sortOrder),
        features,
        rates: {
          stream_rate_ugx: toNullableNumber(planForm.streamRateUgx),
          credit_to_ugx_rate: toNullableNumber(planForm.creditToUgxRate),
        },
      },
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Crown className="h-6 w-6 text-primary" />
              Subscriptions
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Build packages, grant demo access, and shape which moments become paid value.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={openCreatePlan} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
              <Plus className="h-4 w-4" />
              Create Package
            </button>
            <button onClick={() => setShowGrantModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Sparkles className="h-4 w-4" />
              Grant Demo Access
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statsLoading
            ? [...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)
            : [
                { label: 'Active Subscribers', value: stats?.total_active ?? 0, icon: Users, color: 'text-green-500' },
                { label: 'Plans in Market', value: plans.length, icon: Crown, color: 'text-blue-500' },
                { label: 'Cancelled', value: stats?.total_cancelled ?? 0, icon: XCircle, color: 'text-orange-500' },
                { label: 'Recurring Revenue', value: `UGX ${Number(stats?.revenue_this_month ?? 0).toLocaleString()}`, icon: BarChart3, color: 'text-primary' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', color)} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
        </div>

        {stats?.by_plan && Object.keys(stats.by_plan).length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Active Subscribers by Plan</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.by_plan).map(([planName, count]) => (
                <div key={planName} className="flex items-center gap-2">
                  <span className="font-medium">{planName}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6 border-b">
          {(['overview', 'subscribers', 'plans'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn('border-b-2 pb-3 text-sm font-medium capitalize transition-colors', activeTab === tab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4 rounded-xl border bg-card p-5">
              <h3 className="font-semibold">Subscription Packaging Logic</h3>
              <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                <div className="rounded-lg border bg-background/60 p-3">
                  <p className="font-medium text-foreground">Keep open for discovery</p>
                  <p className="mt-1">Browsing, basic streaming, follows, and lightweight social actions should stay free so trust grows before asking for payment.</p>
                </div>
                <div className="rounded-lg border bg-background/60 p-3">
                  <p className="font-medium text-foreground">Best subscription locks</p>
                  <p className="mt-1">Ad-free listening, offline mode, 320kbps quality, higher download quotas, creator upload limits, and multi-artist management are the clearest paid upgrades.</p>
                </div>
                <div className="rounded-lg border bg-background/60 p-3">
                  <p className="font-medium text-foreground">For first-time subscribers</p>
                  <p className="mt-1">Lead with risk-free trials, plain-language features, and one obvious outcome per package instead of complex billing language.</p>
                </div>
                <div className="rounded-lg border bg-background/60 p-3">
                  <p className="font-medium text-foreground">Admin demos</p>
                  <p className="mt-1">Use the grant flow to simulate experience, especially on plans with trial days, so staff can walk new users through value before payment.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border bg-card p-5">
              <h3 className="font-semibold">Health Snapshot</h3>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Active</span><span className="font-medium text-green-500">{stats?.total_active ?? 0}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Expired</span><span className="font-medium text-red-500">{stats?.total_expired ?? 0}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Cancelled</span><span className="font-medium text-orange-500">{stats?.total_cancelled ?? 0}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Tracked plans</span><span className="font-medium">{plans.length}</span></div>
              <div className="pt-2">
                <button onClick={() => setActiveTab('plans')} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Manage Packages
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscribers' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name or email…"
                  className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm"
                />
              </div>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
              <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="all">All Plans</option>
                {plans.map((plan) => <option key={plan.id} value={String(plan.id)}>{plan.name}</option>)}
              </select>
            </div>

            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Expires</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subsLoading ? (
                    [...Array(6)].map((_, i) => <tr key={i} className="border-t"><td colSpan={6} className="px-4 py-3"><div className="h-8 animate-pulse rounded bg-muted" /></td></tr>)
                  ) : !subsData?.data?.length ? (
                    <tr className="border-t"><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No subscriptions found.</td></tr>
                  ) : (
                    subsData.data.map((sub) => {
                      const statusCfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.expired;
                      const StatusIcon = statusCfg.icon;
                      return (
                        <tr key={sub.id} className="border-t transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3"><div><p className="font-medium">{sub.user?.name ?? 'Unknown user'}</p><p className="text-xs text-muted-foreground">{sub.user?.email ?? 'No email'}</p></div></td>
                          <td className="px-4 py-3"><span className="font-medium">{sub.plan?.name ?? 'Unknown plan'}</span></td>
                          <td className="px-4 py-3"><span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', statusCfg.className)}><StatusIcon className="h-3 w-3" />{statusCfg.label}</span></td>
                          <td className="px-4 py-3 text-muted-foreground">{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-3">{sub.amount_paid === 0 ? <span className="text-muted-foreground">Free</span> : <span>{sub.currency} {Number(sub.amount_paid).toLocaleString()}</span>}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {sub.status === 'active' && <button onClick={() => { const reason = window.prompt(`Reason for revoking ${sub.user?.name ?? 'this user'}'s subscription:`)?.trim(); if (reason) revokeMutation.mutate({ subscriptionId: sub.id, reason }); }} disabled={revokeMutation.isPending} className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-500/10" title="Revoke subscription"><UserX className="h-4 w-4" /></button>}
                              {(sub.status === 'expired' || sub.status === 'cancelled') && sub.user && sub.plan && <button onClick={() => { const user = sub.user; const plan = sub.plan; if (!user || !plan) return; setGrantForm({ userId: String(user.id), planId: String(plan.id), days: '30', reason: `Regrant ${plan.name} for product demo` }); setShowGrantModal(true); }} disabled={grantMutation.isPending} className="rounded p-1.5 text-green-500 transition-colors hover:bg-green-500/10" title="Re-grant subscription"><UserCheck className="h-4 w-4" /></button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {subsData?.meta && subsData.meta.last_page > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{subsData.meta.total} total · page {subsData.meta.current_page} of {subsData.meta.last_page}</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border p-2 hover:bg-muted disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                  <button disabled={page >= subsData.meta.last_page} onClick={() => setPage((current) => current + 1)} className="rounded-lg border p-2 hover:bg-muted disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-muted-foreground">
              Packages are strongest when the value is concrete. Recommended locks: ad-free listening, offline access, 320kbps audio, higher download caps, creator upload quotas, and team/label management. Use trial days plus admin-granted demos to help first-time subscribers experience the difference before paying.
            </div>

            <div className="flex justify-end">
              <button onClick={openCreatePlan} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                New Package
              </button>
            </div>

            {plansLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
            ) : !plans.length ? (
              <p className="text-sm text-muted-foreground">No plans found.</p>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 lg:flex-row lg:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Crown className="h-5 w-5 text-primary" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{plan.tier}</span>
                        {plan.trial_days ? <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-500">{plan.trial_days}-day trial</span> : null}
                        {plan.is_popular && <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary">Popular</span>}
                        {plan.is_featured && <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-500">Featured</span>}
                        <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', plan.is_active ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground')}>{plan.is_active ? 'Active' : 'Inactive'}</span>
                        {plan.is_visible === false && <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-xs font-medium text-orange-500">Hidden</span>}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{plan.description}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{plan.currency ?? 'UGX'} {Number(plan.price_monthly ?? plan.price_local ?? 0).toLocaleString()} / month</span>
                        <span>Audio: {plan.max_audio_quality_kbps ?? 320} kbps</span>
                        <span>Downloads: {plan.max_downloads_per_day === null ? 'Unlimited' : plan.max_downloads_per_day ?? 0}/day</span>
                        <span>Uploads: {plan.max_uploads_per_month ?? 0}/month</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button onClick={() => openPlanEditor(plan)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"><Pencil className="h-3.5 w-3.5" />Edit</button>
                      <button onClick={() => savePlanMutation.mutate({ planId: plan.id, payload: { is_active: !plan.is_active } })} disabled={savePlanMutation.isPending} className={cn('rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors', plan.is_active ? 'border-orange-500/20 text-orange-500 hover:bg-orange-500/10' : 'border-green-500/20 text-green-500 hover:bg-green-500/10')}>{savePlanMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : plan.is_active ? 'Deactivate' : 'Activate'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeGrantModal}>
          <div className="w-full max-w-lg space-y-4 rounded-xl border bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Grant Demo Access</h2>
                <p className="text-sm text-muted-foreground">Use this to walk first-time subscribers through the paid experience before they commit.</p>
              </div>
              <button onClick={closeGrantModal} className="rounded p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">User ID</label>
                <input type="number" min="1" value={grantForm.userId} onChange={(e) => setGrantForm((current) => ({ ...current, userId: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" placeholder="e.g. 42" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Plan</label>
                <select value={grantForm.planId} onChange={(e) => setGrantForm((current) => ({ ...current, planId: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2">
                  <option value="">Select a plan</option>
                  {plans.map((plan) => <option key={plan.id} value={String(plan.id)}>{plan.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Duration (days)</label>
                <input type="number" min="1" max="365" value={grantForm.days} onChange={(e) => setGrantForm((current) => ({ ...current, days: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" />
              </div>
            </div>

            {selectedGrantPlan?.trial_days ? (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-muted-foreground">
                {selectedGrantPlan.name} already has a {selectedGrantPlan.trial_days}-day trial. You can use that duration as your guided demo baseline.
                <div className="mt-2">
                  <button
                    onClick={() => setGrantForm((current) => ({ ...current, days: String(selectedGrantPlan.trial_days ?? current.days), reason: current.reason || `Guided first-subscription demo for ${selectedGrantPlan.name}` }))}
                    className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-background"
                  >
                    Use trial duration
                  </button>
                </div>
              </div>
            ) : null}

            <div>
              <label className="mb-1 block text-sm font-medium">Reason</label>
              <textarea rows={3} value={grantForm.reason} onChange={(e) => setGrantForm((current) => ({ ...current, reason: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" placeholder="Why is this package being granted for demo or trial?" />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={closeGrantModal} className="rounded-lg border px-4 py-2 hover:bg-muted">Cancel</button>
              <button onClick={submitGrant} disabled={grantMutation.isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {grantMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                Grant Access
              </button>
            </div>
          </div>
        </div>
      )}

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closePlanModal}>
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{editingPlan ? 'Edit Subscription Package' : 'Create Subscription Package'}</h2>
                <p className="text-sm text-muted-foreground">Build clear packages around visible value, easy trials, and believable upgrade moments.</p>
              </div>
              <button onClick={closePlanModal} className="rounded p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium">Name</label><input type="text" value={planForm.name} onChange={(e) => setPlanForm((current) => ({ ...current, name: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Slug (optional)</label><input type="text" value={planForm.slug} onChange={(e) => setPlanForm((current) => ({ ...current, slug: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" placeholder="starter-plus" /></div>
              <div><label className="mb-1 block text-sm font-medium">Tier</label><select value={planForm.tier} onChange={(e) => setPlanForm((current) => ({ ...current, tier: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2">{['free', 'premium', 'artist', 'label'].map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
              <div><label className="mb-1 block text-sm font-medium">Type</label><select value={planForm.type} onChange={(e) => setPlanForm((current) => ({ ...current, type: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2">{['standard', 'creator', 'enterprise'].map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">Description</label><textarea rows={3} value={planForm.description} onChange={(e) => setPlanForm((current) => ({ ...current, description: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" placeholder="Say plainly what changes in the user experience after upgrading." /></div>
              <div><label className="mb-1 block text-sm font-medium">Currency</label><input type="text" maxLength={3} value={planForm.currency} onChange={(e) => setPlanForm((current) => ({ ...current, currency: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2 uppercase" /></div>
              <div><label className="mb-1 block text-sm font-medium">Region</label><input type="text" value={planForm.region} onChange={(e) => setPlanForm((current) => ({ ...current, region: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Billing Interval</label><input type="text" value={planForm.interval} onChange={(e) => setPlanForm((current) => ({ ...current, interval: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Interval Count</label><input type="number" min="1" value={planForm.intervalCount} onChange={(e) => setPlanForm((current) => ({ ...current, intervalCount: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Monthly Price</label><input type="number" min="0" step="0.01" value={planForm.priceMonthly} onChange={(e) => setPlanForm((current) => ({ ...current, priceMonthly: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Yearly Price</label><input type="number" min="0" step="0.01" value={planForm.priceYearly} onChange={(e) => setPlanForm((current) => ({ ...current, priceYearly: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Local Price</label><input type="number" min="0" step="0.01" value={planForm.priceLocal} onChange={(e) => setPlanForm((current) => ({ ...current, priceLocal: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Sort Order</label><input type="number" min="0" value={planForm.sortOrder} onChange={(e) => setPlanForm((current) => ({ ...current, sortOrder: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Trial Days</label><input type="number" min="0" value={planForm.trialDays} onChange={(e) => setPlanForm((current) => ({ ...current, trialDays: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Duration (days)</label><input type="number" min="1" max="365" value={planForm.durationDays} onChange={(e) => setPlanForm((current) => ({ ...current, durationDays: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Max Downloads / Day</label><input type="number" min="0" value={planForm.maxDownloadsPerDay} onChange={(e) => setPlanForm((current) => ({ ...current, maxDownloadsPerDay: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" placeholder="Leave blank for unlimited" /></div>
              <div><label className="mb-1 block text-sm font-medium">Max Uploads / Month</label><input type="number" min="0" value={planForm.maxUploadsPerMonth} onChange={(e) => setPlanForm((current) => ({ ...current, maxUploadsPerMonth: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Audio Quality (kbps)</label><select value={planForm.maxAudioQualityKbps} onChange={(e) => setPlanForm((current) => ({ ...current, maxAudioQualityKbps: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2">{[128, 192, 256, 320].map((value) => <option key={value} value={String(value)}>{value}</option>)}</select></div>
              <div><label className="mb-1 block text-sm font-medium">Stream Rate (UGX)</label><input type="number" min="0" step="0.01" value={planForm.streamRateUgx} onChange={(e) => setPlanForm((current) => ({ ...current, streamRateUgx: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Credit to UGX Rate</label><input type="number" min="0.0001" step="0.0001" value={planForm.creditToUgxRate} onChange={(e) => setPlanForm((current) => ({ ...current, creditToUgxRate: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" /></div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">Visible Value Points</label><textarea rows={5} value={planForm.features} onChange={(e) => setPlanForm((current) => ({ ...current, features: e.target.value }))} className="w-full rounded-lg border bg-background px-4 py-2" placeholder="One feature per line. Keep these plain and persuasive for first-time subscribers." /></div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[{ key: 'isActive', label: 'Plan is active' }, { key: 'isVisible', label: 'Visible to customers' }, { key: 'isFeatured', label: 'Featured plan' }, { key: 'isPopular', label: 'Popular badge' }, { key: 'offlineMode', label: 'Offline mode enabled' }, { key: 'hasAds', label: 'Ads enabled' }].map((item) => <label key={item.key} className="flex items-center gap-2 rounded-lg border p-3 text-sm"><input type="checkbox" checked={planForm[item.key as keyof PlanFormState] as boolean} onChange={(e) => setPlanForm((current) => ({ ...current, [item.key]: e.target.checked }))} /><span>{item.label}</span></label>)}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closePlanModal} className="rounded-lg border px-4 py-2 hover:bg-muted">Cancel</button>
              <button onClick={submitPlan} disabled={savePlanMutation.isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {savePlanMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                {editingPlan ? 'Save Changes' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
