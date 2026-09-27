'use client';

import Link from 'next/link';
import { ArrowRight, CreditCard } from 'lucide-react';
import { useMySubscription, useSubscriptionPlans } from '@/hooks/useSubscriptions';

export function SubscriptionSummary() {
  const { data: subscription, isLoading: subscriptionLoading } = useMySubscription();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const paidPlans = plans?.filter((plan) => ['emong', 'eris', 'engatuny'].includes(plan.slug));

  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6" aria-labelledby="membership-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 id="membership-heading" className="font-semibold">Membership & subscription</h3>
            <p className="text-sm text-muted-foreground">
              {subscriptionLoading
                ? 'Loading your membership…'
                : `Current plan: ${subscription?.plan_name || subscription?.plan || 'Free'}`}
            </p>
          </div>
        </div>
        <Link
          href="/settings/subscription"
          className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Manage subscription
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {plansLoading
          ? [...Array(3)].map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))
          : paidPlans?.map((plan) => {
              const price = plan.price_local || plan.price;
              const isCurrent = subscription?.plan === plan.slug;

              return (
                <Link
                  key={plan.id}
                  href="/settings/subscription"
                  className={`rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-muted/50 ${
                    isCurrent ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{plan.name}</span>
                    {isCurrent && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-semibold">
                    {price === 0
                      ? 'Free'
                      : `${plan.currency || 'UGX'} ${Number(price).toLocaleString()}`}
                    {price > 0 && (
                      <span className="font-normal text-muted-foreground">/month</span>
                    )}
                  </p>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
