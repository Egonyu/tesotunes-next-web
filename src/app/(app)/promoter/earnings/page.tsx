'use client';

import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Clock, Loader2, Lock, Receipt, Star, Wallet, XCircle } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { useSellerAnalytics } from '@/hooks/usePromotions';
import { describeReleaseWindow } from '@/lib/promotions-proof';

function Money({ ugx, credits }: { ugx: number; credits: number }) {
  return (
    <>
      <p className="truncate text-xl font-bold sm:text-2xl">{formatCurrency(ugx)}</p>
      {credits > 0 && <p className="text-xs text-muted-foreground">+ {formatNumber(credits)} credits</p>}
    </>
  );
}

/**
 * Where a promoter's money is. Figures are the API's: earned counts settled
 * orders only, escrow is the promoter's share of open orders.
 */
export default function PromoterEarningsPage() {
  const { data: analytics, isLoading, isError, refetch } = useSellerAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="rounded-xl bg-card py-16 text-center shadow-sm">
        <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive/40" />
        <p className="font-medium">Could not load your earnings</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Retry
        </button>
      </div>
    );
  }

  const releaseWindow = describeReleaseWindow(analytics.escrow_release_hours);
  const cards = [
    {
      label: 'Earned',
      note: 'Accepted orders, after the platform fee',
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      ugx: analytics.net_revenue_ugx,
      credits: analytics.net_revenue_credits,
    },
    {
      label: 'In escrow',
      note: 'Your share of open orders',
      icon: Lock,
      tone: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
      ugx: analytics.escrow_ugx,
      credits: analytics.escrow_credits,
    },
    {
      label: 'Platform fees',
      note: 'Taken from accepted orders',
      icon: Receipt,
      tone: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
      ugx: analytics.total_platform_fees_ugx,
      credits: analytics.total_platform_fees_credits,
    },
  ];

  const top = analytics.top_performing_promotion;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Earnings</h1>
          <p className="text-sm text-muted-foreground">
            Earned money moves to your wallet after a short dispute hold. Withdraw it from there.
          </p>
        </div>
        <Link
          href="/wallet"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Wallet className="h-4 w-4" />
          Open wallet
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        {cards.map(({ label, note, icon: Icon, tone, ugx, credits }) => (
          <div key={label} className="rounded-xl bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', tone)}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">{label}</span>
            </div>
            <Money ugx={ugx} credits={credits} />
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold">Orders</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Need your proof', value: analytics.awaiting_delivery, href: '/promoter/orders' },
            { label: 'With the buyer', value: analytics.awaiting_buyer, href: '/promoter/orders' },
            { label: 'Completed', value: analytics.completed_orders, href: '/promoter/orders' },
            { label: 'All orders', value: analytics.total_orders, href: '/promoter/orders' },
          ].map(({ label, value, href }) => (
            <Link key={label} href={href} className="rounded-lg bg-muted/50 p-3 hover:bg-muted">
              <p className="text-xl font-bold">{formatNumber(value ?? 0)}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </Link>
          ))}
        </div>
        {analytics.awaiting_delivery > 0 && (
          <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            You&apos;re paid only after you send proof. Buyers review it
            {releaseWindow ? `, and it's paid automatically after ${releaseWindow} if they don't respond.` : '.'}
          </p>
        )}
      </section>

      {top && (
        <section className="rounded-xl bg-card p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold">Most booked service</h2>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {top.featured_image_url && (
                <img src={top.featured_image_url} alt="" className="h-14 w-20 shrink-0 rounded-lg bg-muted object-contain" />
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{top.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {top.price_ugx > 0 && <span>{formatCurrency(top.price_ugx)}</span>}
                  {top.price_credits > 0 && <span>{formatNumber(top.price_credits)} credits</span>}
                  <span>{formatNumber(top.completed_orders)} completed</span>
                  {top.rating_average > 0 && (
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {top.rating_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              href={`/promotions/${top.slug}`}
              className="flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              View
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
