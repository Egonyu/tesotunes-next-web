'use client';

import { Check, Crown, Star, Music2, Building2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscriptionPlans, useMySubscription } from '@/hooks/useSubscriptions';
import Link from 'next/link';

const PLAN_ICONS: Record<string, typeof Crown> = {
  free: Music2,
  premium: Crown,
  artist: Star,
  label: Building2,
};

export default function PricingPage() {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const { data: currentSub } = useMySubscription();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="h-10 w-64 mx-auto bg-muted rounded-lg animate-pulse" />
          <div className="h-5 w-96 mx-auto bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[500px] bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Start free, then upgrade only when the difference feels real. Enjoy clearer audio,
          offline listening, fewer limits, and creator tools when you are ready.
        </p>
        <div className="mx-auto max-w-3xl rounded-2xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-muted-foreground">
          New to online subscriptions? Look for plans with a trial so you can experience the value first before paying long-term.
        </div>
      </div>

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
                'relative rounded-xl border p-6 flex flex-col transition-shadow',
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
                {plan.trial_days ? (
                  <div className="mt-2">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {plan.trial_days}-day trial
                    </span>
                  </div>
                ) : null}
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

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <span className="w-full py-2 rounded-lg border font-medium text-muted-foreground text-center block">
                  Current Plan
                </span>
              ) : plan.slug === 'free' ? (
                <span className="w-full py-2 rounded-lg border font-medium text-muted-foreground text-center block">
                  Default
                </span>
              ) : (
                <Link
                  href="/settings/subscription"
                  className={cn(
                    'w-full py-2 rounded-lg font-medium text-center block transition-colors',
                    plan.is_popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border hover:bg-muted'
                  )}
                >
                  {plan.trial_days ? `Start ${plan.trial_days}-day trial` : 'Get Started'}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      {plans && plans.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center py-3 px-4 font-semibold">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 text-muted-foreground">Audio Quality</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center font-medium">
                    {plan.limits.audio_quality_kbps}kbps
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-muted-foreground">Daily Downloads</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center font-medium">
                    {plan.limits.downloads_per_day === null ? 'Unlimited' : plan.limits.downloads_per_day}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-muted-foreground">Monthly Uploads</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center font-medium">
                    {plan.limits.uploads_per_month === null || plan.limits.uploads_per_month === 0
                      ? '—'
                      : plan.limits.uploads_per_month}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-muted-foreground">Ad-Free</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center">
                    {plan.has_ads ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-muted-foreground">Offline Mode</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center">
                    {plan.offline_mode ? (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-muted-foreground">Price</td>
                {plans.map((plan) => {
                  const price = plan.price_local || plan.price;
                  return (
                    <td key={plan.id} className="py-3 px-4 text-center font-semibold">
                      {price === 0 ? 'Free' : `UGX ${Number(price).toLocaleString()}/mo`}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
