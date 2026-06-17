'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  FileText,
  Loader2,
  Megaphone,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import {
  useActivityHubSummary,
  useActivityHubWallet,
  useActivityHubOrders,
  useActivityHubOpportunities,
  useActivityHubApplications,
  useActivityHubEarnings,
} from '@/hooks/usePromotionsV2';
import type { PromoterTier } from '@/types/promotions-v2';

const TIER_LABELS: Record<PromoterTier, string> = {
  starter: 'Starter',
  rising: 'Rising',
  established: 'Established',
  elite: 'Elite',
};

const TIER_COLORS: Record<PromoterTier, { bg: string; text: string }> = {
  elite: { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-500' },
  established: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-500' },
  rising: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-500' },
  starter: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-500' },
};

function Section({ title, href, linkLabel, children }: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {href && linkLabel && (
          <Link href={href} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            {linkLabel}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default function ActivityHubPage() {
  const { data: summary, isLoading: summaryLoading } = useActivityHubSummary();
  const { data: wallet, isLoading: walletLoading } = useActivityHubWallet();
  const { data: ordersData, isLoading: ordersLoading } = useActivityHubOrders({ per_page: 5 });
  const { data: oppsData, isLoading: oppsLoading } = useActivityHubOpportunities({ per_page: 5 });
  const { data: appsData, isLoading: appsLoading } = useActivityHubApplications({ per_page: 5 });
  const { data: earnings } = useActivityHubEarnings({ per_page: 5 });

  const orders = (ordersData as unknown as { data?: unknown[] })?.data ?? [];
  const opps = (oppsData as unknown as { data?: unknown[] })?.data ?? [];
  const apps = (appsData as unknown as { data?: unknown[] })?.data ?? [];

  const promoter = summary?.promoter;
  const pending = summary?.pending_actions;

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Hub</h1>
          <p className="text-sm text-muted-foreground">
            Your complete view — wallet, orders, opportunities, and earnings in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/become-promoter"
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Become a promoter
          </Link>
          <Link
            href="/promotions"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse services
          </Link>
        </div>
      </div>

      {/* Wallet + Promoter status */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Credits */}
        <div className="rounded-xl bg-card shadow-sm p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Credits</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
              <CreditCard className="h-4 w-4 text-violet-500" />
            </span>
          </div>
          {walletLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <p className="text-2xl font-bold">{formatNumber(wallet?.credits ?? 0)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">platform credits</p>
            </>
          )}
        </div>

        {/* UGX balance */}
        <div className="rounded-xl bg-card shadow-sm p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">UGX Wallet</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
              <Coins className="h-4 w-4 text-emerald-500" />
            </span>
          </div>
          {walletLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <p className="text-2xl font-bold">{formatCurrency(wallet?.ugx_balance ?? 0)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Ugandan Shillings</p>
            </>
          )}
        </div>

        {/* Promoter badge */}
        <div className="rounded-xl bg-card shadow-sm p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Promoter status</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
              <Star className="h-4 w-4 text-amber-500" />
            </span>
          </div>
          {summaryLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : promoter?.is_promoter ? (
            <>
              <div className="flex items-center gap-1.5">
                <p className="text-lg font-bold">{TIER_LABELS[promoter.tier]}</p>
                {promoter.is_verified && <BadgeCheck className="h-4 w-4 text-sky-500" />}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{promoter.total_completed_orders} orders completed</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-muted-foreground">Not a promoter</p>
              <Link href="/become-promoter" className="mt-0.5 block text-xs font-medium text-primary hover:underline">
                Join for free →
              </Link>
            </>
          )}
        </div>

        {/* Pending actions */}
        <div className="rounded-xl bg-card shadow-sm p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Actions needed</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40">
              <Clock className="h-4 w-4 text-rose-500" />
            </span>
          </div>
          {summaryLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <div className="space-y-1.5 text-sm">
              {pending?.buyer_orders_awaiting_review ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Orders to review</span>
                  <span className="font-semibold text-amber-500">{pending.buyer_orders_awaiting_review}</span>
                </div>
              ) : null}
              {pending?.seller_orders_to_verify ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Orders to verify</span>
                  <span className="font-semibold text-sky-500">{pending.seller_orders_to_verify}</span>
                </div>
              ) : null}
              {pending?.pending_applications ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending applications</span>
                  <span className="font-semibold text-violet-500">{pending.pending_applications}</span>
                </div>
              ) : null}
              {!pending?.buyer_orders_awaiting_review && !pending?.seller_orders_to_verify && !pending?.pending_applications && (
                <p className="text-muted-foreground text-xs">All clear!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Earnings summary */}
      {earnings && (
        <div className="rounded-xl bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              </span>
              <h2 className="font-semibold">Promoter earnings</h2>
            </div>
            <Link href="/artist/promotions/analytics" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Full analytics <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Total UGX earned</p>
              <p className="text-2xl font-bold">{formatCurrency(earnings.total_ugx)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total credits earned</p>
              <p className="text-2xl font-bold">{formatNumber(earnings.total_credits)} <span className="text-sm font-normal text-muted-foreground">cr</span></p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders */}
        <Section title="Recent orders (buyer)" href="/promotions/purchases" linkLabel="All purchases">
          <div className="rounded-xl bg-card shadow-sm overflow-hidden">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-10 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <Link href="/promotions" className="mt-2 block text-xs text-primary hover:underline">Browse services</Link>
              </div>
            ) : (
              <div className="divide-y">
                {(orders as Record<string, unknown>[]).map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{String(order.title ?? order.id ?? '—')}</p>
                      <p className="text-xs text-muted-foreground capitalize">{String(order.status ?? '—')}</p>
                    </div>
                    <span className={cn(
                      'ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                      order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                      order.status === 'pending_verification' ? 'bg-amber-50 text-amber-600' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {String(order.status ?? '—')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Posted opportunities */}
        <Section title="My posted opportunities" href="/promotions/opportunities" linkLabel="All opportunities">
          <div className="rounded-xl bg-card shadow-sm overflow-hidden">
            {oppsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : opps.length === 0 ? (
              <div className="py-10 text-center">
                <Target className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No opportunities posted</p>
                <Link href="/artist/promotions/opportunities/create" className="mt-2 block text-xs text-primary hover:underline">Post one now</Link>
              </div>
            ) : (
              <div className="divide-y">
                {(opps as Record<string, unknown>[]).map((opp, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{String(opp.title ?? '—')}</p>
                      <p className="text-xs text-muted-foreground">{String(opp.application_count ?? 0)} applications</p>
                    </div>
                    <span className={cn(
                      'ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                      opp.status === 'open' ? 'bg-emerald-50 text-emerald-600' :
                      opp.status === 'reviewing' ? 'bg-amber-50 text-amber-600' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {String(opp.status ?? '—')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* My applications (as promoter) */}
        <Section title="My applications (as promoter)" href="/promotions/opportunities" linkLabel="Browse opportunities">
          <div className="rounded-xl bg-card shadow-sm overflow-hidden">
            {appsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : apps.length === 0 ? (
              <div className="py-10 text-center">
                <Megaphone className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No applications submitted</p>
                <Link href="/promotions/opportunities" className="mt-2 block text-xs text-primary hover:underline">Find opportunities</Link>
              </div>
            ) : (
              <div className="divide-y">
                {(apps as Record<string, unknown>[]).map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {String((app.opportunity as Record<string, unknown>)?.title ?? '—')}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{String(app.status ?? '—')}</p>
                    </div>
                    <span className={cn(
                      'ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                      app.status === 'awarded' ? 'bg-emerald-50 text-emerald-600' :
                      app.status === 'shortlisted' ? 'bg-sky-50 text-sky-600' :
                      app.status === 'submitted' ? 'bg-amber-50 text-amber-600' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {String(app.status ?? '—')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Quick links */}
        <Section title="Quick links">
          <div className="grid gap-2">
            {[
              { href: '/promotions', icon: ShieldCheck, light: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-500', label: 'Services marketplace', desc: 'Buy promotion services' },
              { href: '/promoters', icon: Users, light: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-500', label: 'Find a promoter', desc: 'Browse by platform and niche' },
              { href: '/artist/promotions', icon: BarChart3, light: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-500', label: 'Seller dashboard', desc: 'Manage your services' },
              { href: '/artist/promotions/analytics', icon: TrendingUp, light: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-500', label: 'Promotion analytics', desc: 'Revenue and performance' },
            ].map(({ href, icon: Icon, light, text, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl bg-card shadow-sm p-4 transition-shadow hover:shadow-md"
              >
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', light)}>
                  <Icon className={cn('h-4 w-4', text)} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
