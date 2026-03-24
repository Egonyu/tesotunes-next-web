'use client';

import { useState, useEffect } from 'react';
import { Check, Crown, Star, Music2, Building2, X, AlertTriangle, RefreshCw, Wifi, WifiOff, Loader2, History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn, getErrorMessage } from '@/lib/utils';
import {
  useSubscriptionPlans,
  useMySubscription,
  useSubscribe,
  useCancelSubscription,
  useChangePlan,
  useToggleAutoRenew,
  useSubscriptionPaymentStatus,
  useSubscriptionHistory,
  type SubscribeRequest,
  type CurrentSubscription,
} from '@/hooks/useSubscriptions';
import { toast } from 'sonner';

const PLAN_ICONS: Record<string, typeof Crown> = {
  free: Music2,
  premium: Crown,
  artist: Star,
  label: Building2,
};

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState<'plan' | 'history'>('plan');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const paymentMethod = 'zengapay' as const;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [pendingPaymentId, setPendingPaymentId] = useState<number | null>(null);

  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentSub } = useMySubscription();
  const subscribe = useSubscribe();
  const cancelSubscription = useCancelSubscription();
  const changePlan = useChangePlan();
  const toggleAutoRenew = useToggleAutoRenew();
  const { data: paymentStatus } = useSubscriptionPaymentStatus(pendingPaymentId);
  const { data: historyData, isLoading: historyLoading } = useSubscriptionHistory({ per_page: 20 });

  // Watch payment polling result
  useEffect(() => {
    if (!paymentStatus) return;
    if (paymentStatus.status === 'completed') {
      toast.success('Payment confirmed! Your subscription is now active.');
      setPendingPaymentId(null);
      setSelectedPlanId(null);
      setPhoneNumber('');
    } else if (paymentStatus.status === 'failed' || paymentStatus.status === 'cancelled') {
      toast.error(paymentStatus.message || 'Payment was not completed.');
      setPendingPaymentId(null);
    }
  }, [paymentStatus]);

  const isUpgradeOrChange = currentSub?.has_subscription && currentSub.status === 'active';

  const handleSubscribe = async (planId: number) => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    try {
      if (isUpgradeOrChange) {
        // Changing plan — use change-plan endpoint
        const result = await changePlan.mutateAsync({
          plan_id: planId,
          payment_method: 'mobile_money',
          phone_number: phoneNumber,
        });
        toast.success(result.message || 'Plan changed successfully!');
        setSelectedPlanId(null);
        setPhoneNumber('');
      } else {
        // New subscription
        const data: SubscribeRequest = {
          plan_id: planId,
          payment_method: 'mobile_money',
          phone_number: phoneNumber,
        };

        const result = await subscribe.mutateAsync(data);
        if (result.payment_id && result.payment_status !== 'completed') {
          // ZengaPay async — start polling
          setPendingPaymentId(result.payment_id);
          toast.info('Please approve the payment on your phone.');
        } else {
          toast.success(result.message || 'Subscription activated!');
          setSelectedPlanId(null);
          setPhoneNumber('');
        }
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to subscribe'));
    }
  };

  const handleCancel = async () => {
    if (!currentSub?.subscription_id) return;
    try {
      await cancelSubscription.mutateAsync({
        subscriptionId: currentSub.subscription_id,
        reason: cancelReason || undefined,
      });
      toast.success('Subscription cancelled. It will remain active until the expiry date.');
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to cancel subscription'));
    }
  };

  const handleToggleAutoRenew = async () => {
    try {
      await toggleAutoRenew.mutateAsync();
      toast.success(
        currentSub?.auto_renew
          ? 'Auto-renewal disabled.'
          : 'Auto-renewal enabled.'
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update auto-renewal'));
    }
  };

  if (plansLoading) {
    return (
      <div className="space-y-8">
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Subscription</h2>
        <p className="text-muted-foreground text-sm">
          Manage your subscription and billing preferences.
        </p>
      </div>

      {/* Expiry Warning Banner — GAP-UI-07 */}
      {currentSub?.has_subscription &&
        currentSub.status === 'active' &&
        typeof currentSub.days_remaining === 'number' &&
        currentSub.days_remaining <= 7 && (
          <div
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border',
              currentSub.days_remaining <= 1
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-amber-500/10 border-amber-500/20'
            )}
          >
            <AlertTriangle
              className={cn(
                'h-5 w-5 shrink-0 mt-0.5',
                currentSub.days_remaining <= 1 ? 'text-red-500' : 'text-amber-500'
              )}
            />
            <div className="flex-1">
              <p
                className={cn(
                  'font-medium',
                  currentSub.days_remaining <= 1 ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'
                )}
              >
                {currentSub.days_remaining === 0
                  ? 'Your subscription expires today!'
                  : currentSub.days_remaining === 1
                    ? 'Your subscription expires tomorrow'
                    : `Your subscription expires in ${currentSub.days_remaining} days`}
              </p>
              <p className="text-sm text-muted-foreground">
                Renew now to keep your {currentSub.plan_name || currentSub.plan} benefits uninterrupted.
              </p>
            </div>
            {!currentSub.auto_renew && (
              <button
                onClick={() => setActiveTab('plan')}
                className="text-sm font-medium text-primary hover:underline shrink-0"
              >
                Renew Now
              </button>
            )}
          </div>
        )}

      {/* Tab navigation */}
      <div className="flex border-b gap-6">
        <button
          onClick={() => setActiveTab('plan')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'plan'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Current Plan
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'history'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <History className="h-3.5 w-3.5" />
          Billing History
        </button>
      </div>

      {activeTab === 'history' ? (
        <BillingHistoryTab data={historyData} isLoading={historyLoading} />
      ) : (
        <>
          {/* Current Plan Card — inside tab */}
          {currentSub && (
            <CurrentPlanCard
              sub={currentSub}
              onCancel={() => setShowCancelModal(true)}
              onToggleAutoRenew={handleToggleAutoRenew}
              isTogglingAutoRenew={toggleAutoRenew.isPending}
            />
          )}

          {/* Plans Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans?.map((plan) => {
          const Icon = PLAN_ICONS[plan.slug] || Music2;
          const isCurrentPlan = currentSub?.plan === plan.slug;
          const price = plan.price_local || plan.price;

          return (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-xl border p-6 transition-shadow',
                plan.is_popular && 'border-primary shadow-lg',
                isCurrentPlan && 'bg-muted/30 ring-2 ring-primary/20'
              )}
            >
              {plan.is_popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Most Popular
                </span>
              )}

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-3xl font-bold">
                  {price === 0 ? 'Free' : `UGX ${Number(price).toLocaleString()}`}
                </span>
                {price > 0 && (
                  <span className="text-muted-foreground text-sm">/month</span>
                )}
              </div>

              {/* Plan Limits */}
              <div className="space-y-2 mb-4 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Audio Quality</span>
                  <span className="font-medium text-foreground">{plan.limits.audio_quality_kbps}kbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Downloads/Day</span>
                  <span className="font-medium text-foreground">
                    {plan.limits.downloads_per_day === null ? 'Unlimited' : plan.limits.downloads_per_day}
                  </span>
                </div>
                {plan.limits.uploads_per_month !== null && plan.limits.uploads_per_month > 0 && (
                  <div className="flex justify-between">
                    <span>Uploads/Month</span>
                    <span className="font-medium text-foreground">{plan.limits.uploads_per_month}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Ads</span>
                  <span className={cn('font-medium', plan.has_ads ? 'text-orange-500' : 'text-green-500')}>
                    {plan.has_ads ? 'Yes' : 'No Ads'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Offline</span>
                  {plan.offline_mode ? (
                    <Wifi className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-2 rounded-lg border font-medium text-muted-foreground cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : plan.slug === 'free' ? (
                <button
                  disabled
                  className="w-full py-2 rounded-lg border font-medium text-muted-foreground cursor-not-allowed"
                >
                  Default
                </button>
              ) : (
                <button
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={cn(
                    'w-full py-2 rounded-lg font-medium transition-colors',
                    plan.is_popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border hover:bg-muted'
                  )}
                >
                  {isUpgradeOrChange ? 'Change Plan' : 'Subscribe'}
                </button>
              )}
            </div>
          );
        })}
          </div>
        </>
      )}

      {/* Payment Modal */}
      {selectedPlanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-xl border p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {isUpgradeOrChange ? 'Change Plan' : 'Complete Subscription'}
              </h3>
              <button onClick={() => { setSelectedPlanId(null); setPendingPaymentId(null); }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pending payment polling indicator */}
            {pendingPaymentId && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                <p className="text-sm text-blue-500">
                  Waiting for payment approval on your phone...
                </p>
              </div>
            )}

            {!pendingPaymentId && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <div className="space-y-2">
                    <div className="w-full p-3 rounded-lg border border-primary bg-primary/5 text-left">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded bg-green-600" />
                        <span>ZengaPay Mobile Money</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0770 000 000"
                    className="w-full px-4 py-3 rounded-lg border bg-background"
                  />
                </div>

                <button
                  onClick={() => handleSubscribe(selectedPlanId)}
                  disabled={subscribe.isPending || changePlan.isPending}
                  className={cn(
                    'w-full px-6 py-3 rounded-lg font-medium transition-colors',
                    subscribe.isPending || changePlan.isPending
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {subscribe.isPending || changePlan.isPending ? 'Processing...' : 'Subscribe Now'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-xl border p-6 max-w-md w-full space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold">Cancel Subscription?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your subscription will remain active until{' '}
                  {currentSub?.expires_at
                    ? new Date(currentSub.expires_at).toLocaleDateString()
                    : 'the end of the current period'}
                  .
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reason for cancelling (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Help us improve..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelSubscription.isPending}
                className="flex-1 px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {cancelSubscription.isPending ? 'Cancelling...' : 'Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Current Plan Card Subcomponent
// ============================================================================

function CurrentPlanCard({
  sub,
  onCancel,
  onToggleAutoRenew,
  isTogglingAutoRenew,
}: {
  sub: CurrentSubscription;
  onCancel: () => void;
  onToggleAutoRenew: () => void;
  isTogglingAutoRenew: boolean;
}) {
  if (!sub.has_subscription) {
    return (
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="text-lg font-semibold">Free</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
            Free Tier
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Quality</p>
            <p className="font-medium">{sub.limits.audio_quality_kbps}kbps</p>
          </div>
          <div>
            <p className="text-muted-foreground">Downloads</p>
            <p className="font-medium">{sub.limits.downloads_per_day}/day</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ads</p>
            <p className="font-medium text-orange-500">Yes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Plan</p>
          <p className="text-lg font-semibold capitalize">{sub.plan_name || sub.plan}</p>
        </div>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium capitalize',
            sub.status === 'active'
              ? 'bg-green-500/10 text-green-500'
              : sub.status === 'cancelled'
                ? 'bg-orange-500/10 text-orange-500'
                : sub.status === 'expired'
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-blue-500/10 text-blue-500'
          )}
        >
          {sub.status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Days Remaining</p>
          <p className="font-medium">{sub.days_remaining ?? '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Expires</p>
          <p className="font-medium">
            {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Quality</p>
          <p className="font-medium">{sub.limits.audio_quality_kbps}kbps</p>
        </div>
        <div>
          <p className="text-muted-foreground">Downloads</p>
          <p className="font-medium">
            {sub.limits.downloads_per_day === 0 ? 'Unlimited' : `${sub.limits.downloads_per_day}/day`}
          </p>
        </div>
      </div>

      {/* Feature flags */}
      <div className="flex gap-4 mt-3">
        {sub.ad_free && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
            Ad-Free
          </span>
        )}
        {sub.offline_access && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
            Offline Access
          </span>
        )}
      </div>

      {/* Auto-renew toggle */}
      {sub.status === 'active' && (
        <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Auto-Renewal</span>
          </div>
          <button
            onClick={onToggleAutoRenew}
            disabled={isTogglingAutoRenew}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              sub.auto_renew ? 'bg-primary' : 'bg-muted-foreground/30'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                sub.auto_renew ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      )}

      {/* Cancel button for active subscriptions */}
      {sub.status === 'active' && (
        <button
          onClick={onCancel}
          className="mt-4 w-full sm:w-auto px-6 py-2 text-sm border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          Cancel Subscription
        </button>
      )}

      {/* Cancelled notice */}
      {sub.status === 'cancelled' && sub.expires_at && (
        <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm text-orange-500">
            Your subscription was cancelled. Access continues until{' '}
            {new Date(sub.expires_at).toLocaleDateString()}.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Billing History Tab — GAP-UI-04
// ============================================================================

const STATUS_STYLES: Record<string, { icon: typeof CheckCircle; className: string }> = {
  active:    { icon: CheckCircle, className: 'text-green-500' },
  expired:   { icon: Clock,       className: 'text-muted-foreground' },
  cancelled: { icon: XCircle,     className: 'text-red-500' },
};

function BillingHistoryTab({
  data,
  isLoading,
}: {
  data?: import('@/hooks/useSubscriptions').SubscriptionHistoryEntry[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <History className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="font-medium">No billing history yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your past subscription periods will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((entry) => {
        const style = STATUS_STYLES[entry.status] ?? STATUS_STYLES.expired;
        const StatusIcon = style.icon;

        return (
          <div
            key={entry.id}
            className="flex items-start gap-4 p-4 rounded-lg border bg-card"
          >
            <StatusIcon className={cn('h-5 w-5 mt-0.5 shrink-0', style.className)} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium capitalize">{entry.plan.name}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full capitalize',
                    entry.status === 'active'
                      ? 'bg-green-500/10 text-green-500'
                      : entry.status === 'cancelled'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {entry.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {new Date(entry.started_at).toLocaleDateString()} →{' '}
                {new Date(entry.expires_at).toLocaleDateString()}
              </p>
              {entry.cancellation_reason && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Cancelled: {entry.cancellation_reason}
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="font-medium">
                {entry.amount_paid === 0
                  ? 'Free'
                  : `${entry.currency} ${Number(entry.amount_paid).toLocaleString()}`}
              </p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                {entry.payment_method.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
