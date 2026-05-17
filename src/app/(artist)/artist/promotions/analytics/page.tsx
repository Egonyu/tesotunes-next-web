'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Megaphone,
  ShieldCheck,
  Star,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { useSellerAnalytics } from '@/hooks/usePromotions';

export default function PromotionAnalyticsPage() {
  const { data: analytics, isLoading, isError } = useSellerAnalytics();

  const stats = analytics
    ? [
        {
          label: 'Total services',
          value: formatNumber(analytics.total_promotions),
          sub: `${analytics.active_promotions} active`,
          icon: Megaphone,
          light: 'bg-violet-50 dark:bg-violet-950/40',
          text: 'text-violet-500',
        },
        {
          label: 'Total orders',
          value: formatNumber(analytics.total_orders),
          sub: `${analytics.pending_verifications} pending`,
          icon: Clock,
          light: 'bg-amber-50 dark:bg-amber-950/40',
          text: 'text-amber-500',
        },
        {
          label: 'Completed',
          value: formatNumber(analytics.completed_orders),
          sub: `${analytics.settled_orders} settled`,
          icon: CheckCircle2,
          light: 'bg-emerald-50 dark:bg-emerald-950/40',
          text: 'text-emerald-500',
        },
        {
          label: 'Avg rating',
          value: analytics.average_rating ? analytics.average_rating.toFixed(1) : '—',
          sub: 'from buyers',
          icon: Star,
          light: 'bg-amber-50 dark:bg-amber-950/40',
          text: 'text-amber-500',
        },
        {
          label: 'Conversion',
          value: `${(analytics.conversion_rate * 100).toFixed(1)}%`,
          sub: 'orders / impressions',
          icon: TrendingUp,
          light: 'bg-sky-50 dark:bg-sky-950/40',
          text: 'text-sky-500',
        },
        {
          label: 'Platform fees',
          value: formatNumber(analytics.total_platform_fees_credits),
          sub: `${formatCurrency(analytics.total_platform_fees_ugx)} UGX`,
          icon: ShieldCheck,
          light: 'bg-rose-50 dark:bg-rose-950/40',
          text: 'text-rose-500',
        },
      ]
    : [];

  const revenue = analytics
    ? [
        {
          label: 'Gross revenue (credits)',
          value: formatNumber(analytics.total_revenue_credits) + ' cr',
          sub: formatCurrency(analytics.total_revenue_ugx) + ' UGX',
          icon: CreditCard,
          light: 'bg-violet-50 dark:bg-violet-950/40',
          text: 'text-violet-500',
        },
        {
          label: 'Net revenue (credits)',
          value: formatNumber(analytics.net_revenue_credits) + ' cr',
          sub: formatCurrency(analytics.net_revenue_ugx) + ' UGX',
          icon: Zap,
          light: 'bg-emerald-50 dark:bg-emerald-950/40',
          text: 'text-emerald-500',
        },
        {
          label: 'Platform fees deducted',
          value: formatNumber(analytics.total_platform_fees_credits) + ' cr',
          sub: formatCurrency(analytics.total_platform_fees_ugx) + ' UGX',
          icon: BarChart3,
          light: 'bg-rose-50 dark:bg-rose-950/40',
          text: 'text-rose-500',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/artist/promotions"
            className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Promotion Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Revenue, orders, and performance across your promotion services
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/artist/promotions/orders"
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            View orders
          </Link>
          <Link
            href="/artist/promotions/create"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            New service
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-card shadow-sm py-16 text-center">
          <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive/40" />
          <p className="font-medium">Could not load analytics</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
            Retry
          </button>
        </div>
      ) : analytics ? (
        <>
          {/* Performance stats */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Performance</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {stats.map(({ label, value, sub, icon: Icon, light, text }) => (
                <div key={label} className="rounded-xl bg-card shadow-sm p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', light)}>
                      <Icon className={cn('h-4 w-4', text)} />
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue breakdown */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Revenue</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {revenue.map(({ label, value, sub, icon: Icon, light, text }) => (
                <div key={label} className="rounded-xl bg-card shadow-sm p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', light)}>
                      <Icon className={cn('h-4 w-4', text)} />
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top performing promotion */}
          {analytics.top_performing_promotion && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Top performing service</h2>
              <div className="rounded-xl bg-card shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    {analytics.top_performing_promotion.featured_image && (
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={analytics.top_performing_promotion.featured_image}
                          alt={analytics.top_performing_promotion.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{analytics.top_performing_promotion.title}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                        {analytics.top_performing_promotion.short_description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-medium text-violet-600 dark:text-violet-400">
                          {formatNumber(analytics.top_performing_promotion.price_credits)} cr
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(analytics.top_performing_promotion.price_ugx)} UGX
                        </span>
                        {analytics.top_performing_promotion.rating_average > 0 && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-400" />
                            {analytics.top_performing_promotion.rating_average.toFixed(1)}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          {formatNumber(analytics.top_performing_promotion.completed_orders)} orders
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/promotions/${analytics.top_performing_promotion.slug}`}
                    className="flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    View
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Guidance */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                light: 'bg-violet-50 dark:bg-violet-950/40',
                text: 'text-violet-500',
                title: 'Grow your conversion rate',
                desc: 'Better images, clear pricing, and fast responses are the strongest drivers of buyer conversion.',
              },
              {
                icon: Star,
                light: 'bg-amber-50 dark:bg-amber-950/40',
                text: 'text-amber-500',
                title: 'Build your rating',
                desc: 'Deliver every order on time and follow up with buyers to ask for a review after completion.',
              },
              {
                icon: CheckCircle2,
                light: 'bg-emerald-50 dark:bg-emerald-950/40',
                text: 'text-emerald-500',
                title: 'Verify orders quickly',
                desc: 'Fast verification signals reliability to buyers and improves your ranking in discovery.',
              },
            ].map(({ icon: Icon, light, text, title, desc }) => (
              <div key={title} className="rounded-xl bg-card shadow-sm p-4">
                <div className="mb-2 flex items-center gap-3">
                  <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', light)}>
                    <Icon className={cn('h-4 w-4', text)} />
                  </span>
                  <h3 className="text-sm font-semibold">{title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
