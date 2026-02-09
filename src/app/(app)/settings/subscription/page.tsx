'use client';

import { useState } from 'react';
import { Check, Crown, Zap, Music2, Star, CreditCard, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSubscriptionPlans,
  useMySubscription,
  useSubscribe,
  useCancelSubscription,
  useReactivateSubscription,
  BillingCycle,
  SubscribeRequest,
} from '@/hooks/useSubscriptions';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'mtn_momo' | 'airtel_money'>('mtn_momo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentSubscription } = useMySubscription();
  const subscribe = useSubscribe();
  const cancelSubscription = useCancelSubscription();
  const reactivateSubscription = useReactivateSubscription();
  
  const handleSubscribe = async (planId: number) => {
    if (paymentMethod !== 'wallet' && !phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }
    
    const subscribeData: SubscribeRequest = {
      plan_id: planId,
      billing_cycle: billingCycle,
      payment_method: paymentMethod,
      phone: paymentMethod !== 'wallet' ? phoneNumber : undefined,
      auto_renew: true,
    };
    
    try {
      const result = await subscribe.mutateAsync(subscribeData);
      toast.success(result.message || 'Subscription activated successfully!');
      setSelectedPlanId(null);
      setPhoneNumber('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to subscribe');
    }
  };
  
  const handleCancel = async () => {
    try {
      const result = await cancelSubscription.mutateAsync({
        reason: cancelReason,
        cancel_immediately: false,
      });
      toast.success(result.message || 'Subscription cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to cancel subscription');
    }
  };
  
  const handleReactivate = async () => {
    try {
      await reactivateSubscription.mutateAsync();
      toast.success('Subscription reactivated successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reactivate subscription');
    }
  };
  
  if (plansLoading) {
    return (
      <div className="space-y-8">
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
      
      {/* Current Plan */}
      {currentSubscription && (
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-lg font-semibold capitalize">{currentSubscription.plan.name}</p>
            </div>
            <span
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium capitalize',
                currentSubscription.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : currentSubscription.status === 'cancelled'
                    ? 'bg-orange-500/10 text-orange-500'
                    : 'bg-red-500/10 text-red-500'
              )}
            >
              {currentSubscription.status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Billing Cycle</p>
              <p className="font-medium capitalize">{currentSubscription.billing_cycle}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Next Billing Date</p>
              <p className="font-medium">
                {new Date(currentSubscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {currentSubscription.cancel_at_period_end && (
            <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-orange-500">
                Your subscription will end on{' '}
                {new Date(currentSubscription.current_period_end).toLocaleDateString()}.
              </p>
              <button
                onClick={handleReactivate}
                disabled={reactivateSubscription.isPending}
                className="mt-2 text-sm font-medium text-orange-500 hover:underline"
              >
                {reactivateSubscription.isPending ? 'Reactivating...' : 'Reactivate Subscription'}
              </button>
            </div>
          )}
          
          {currentSubscription.status === 'active' && !currentSubscription.cancel_at_period_end && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="mt-4 w-full sm:w-auto px-6 py-2 text-sm border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      )}
      
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-4 p-1 rounded-lg bg-muted">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              billingCycle === 'monthly'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              billingCycle === 'yearly'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Yearly
            <span className="ml-2 text-xs text-green-500">Save 20%</span>
          </button>
        </div>
      </div>
      
      {/* Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans?.map((plan) => {
          const Icon = plan.slug === 'premium' ? Crown : plan.slug === 'artist' ? Star : Music2;
          const isCurrentPlan = currentSubscription?.plan.id === plan.id;
          const price = billingCycle === 'yearly'
            ? plan.price_yearly
            : plan.price_monthly;
          
          return (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-xl border p-6 transition-shadow',
                plan.is_popular && 'border-primary shadow-lg',
                isCurrentPlan && 'bg-muted/30'
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
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>
              
              <div className="text-center mb-6">
                <span className="text-3xl font-bold">
                  {price === 0 ? 'Free' : `UGX ${price.toLocaleString()}`}
                </span>
                {price > 0 && (
                  <span className="text-muted-foreground text-sm">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
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
                  {plan.price_monthly === 0 ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Payment Modal */}
      {selectedPlanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-xl border p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Complete Subscription</h3>
              <button onClick={() => setSelectedPlanId(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="space-y-2">
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={cn(
                    'w-full p-3 rounded-lg border text-left transition-colors',
                    paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'hover:border-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span>TesoWallet</span>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('mtn_momo')}
                  className={cn(
                    'w-full p-3 rounded-lg border text-left transition-colors',
                    paymentMethod === 'mtn_momo' ? 'border-primary bg-primary/5' : 'hover:border-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-[#FFCC00]" />
                    <span>MTN Mobile Money</span>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('airtel_money')}
                  className={cn(
                    'w-full p-3 rounded-lg border text-left transition-colors',
                    paymentMethod === 'airtel_money' ? 'border-primary bg-primary/5' : 'hover:border-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-[#E40000]" />
                    <span>Airtel Money</span>
                  </div>
                </button>
              </div>
            </div>
            
            {paymentMethod !== 'wallet' && (
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={paymentMethod === 'mtn_momo' ? '0770 000 000' : '0750 000 000'}
                  className="w-full px-4 py-3 rounded-lg border bg-background"
                />
              </div>
            )}
            
            <button
              onClick={() => handleSubscribe(selectedPlanId)}
              disabled={subscribe.isPending}
              className={cn(
                'w-full px-6 py-3 rounded-lg font-medium transition-colors',
                subscribe.isPending
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {subscribe.isPending ? 'Processing...' : 'Subscribe Now'}
            </button>
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
                  Your subscription will remain active until the end of the current billing period.
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

