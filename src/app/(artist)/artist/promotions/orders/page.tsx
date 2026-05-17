'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  MessageSquareWarning,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { useMyPromotionOrders } from '@/hooks/usePromotions';
import { OrderCard, PromotionsPagination } from '@/components/promotions';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending_verification', label: 'Pending' },
  { value: 'verification_submitted', label: 'Submitted' },
  { value: 'completed', label: 'Completed' },
  { value: 'disputed', label: 'Disputed' },
];

export default function ArtistPromotionOrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useMyPromotionOrders({
    status: status || undefined,
    page,
  });

  const orders = data?.data ?? [];

  const summary = useMemo(() => {
    const totalCredits = orders.reduce((sum, o) => sum + o.total_credits, 0);
    const totalUgx = orders.reduce((sum, o) => sum + o.total_ugx, 0);
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending_verification').length,
      submitted: orders.filter((o) => o.status === 'verification_submitted').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      disputed: orders.filter((o) => o.status === 'disputed').length,
      totalCredits,
      totalUgx,
    };
  }, [orders]);

  const stats = [
    {
      label: 'Total Orders',
      value: formatNumber(summary.total),
      icon: FileText,
      light: 'bg-violet-50 dark:bg-violet-950/40',
      text: 'text-violet-500',
    },
    {
      label: 'Pending',
      value: formatNumber(summary.pending),
      icon: Clock,
      light: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-500',
    },
    {
      label: 'Submitted',
      value: formatNumber(summary.submitted),
      icon: ShieldCheck,
      light: 'bg-sky-50 dark:bg-sky-950/40',
      text: 'text-sky-500',
    },
    {
      label: 'Completed',
      value: formatNumber(summary.completed),
      icon: CheckCircle2,
      light: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-500',
    },
    {
      label: 'Credits (cr)',
      value: formatNumber(summary.totalCredits),
      icon: CreditCard,
      light: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-orange-500',
    },
    {
      label: 'Disputed',
      value: formatNumber(summary.disputed),
      icon: MessageSquareWarning,
      light: 'bg-red-50 dark:bg-red-950/40',
      text: 'text-red-500',
    },
  ];

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
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Review buyer proof and verify delivery
            </p>
          </div>
        </div>
        <Link
          href="/artist/promotions/create"
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Create New Service
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon, light, text }) => (
          <div key={label} className="rounded-xl bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', light)}>
                <Icon className={cn('h-4 w-4', text)} />
              </span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* UGX summary */}
      {summary.totalUgx > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-card shadow-sm p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </span>
          <div>
            <p className="text-sm font-medium">
              {formatCurrency(summary.totalUgx)} UGX in this queue
            </p>
            <p className="text-xs text-muted-foreground">
              Across all visible orders — released upon verification
            </p>
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="rounded-xl bg-card shadow-sm">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Verification Queue</h2>
            <p className="text-xs text-muted-foreground">
              Open an order to verify proof or reject with a reason
            </p>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={cn(
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  status === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive/40" />
              <p className="font-medium">Could not load orders</p>
              <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium">No orders in this queue</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Orders appear here when buyers purchase your services
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  href="/promotions"
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  View Marketplace
                </Link>
                <Link
                  href="/artist/promotions"
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Manage Listings
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors"
                    onClick={() => router.push(`/artist/promotions/orders/${order.id}`)}
                  >
                    <OrderCard order={order} showBuyer />
                  </div>
                ))}
              </div>

              <PromotionsPagination
                currentPage={data?.meta.current_page ?? 1}
                lastPage={data?.meta.last_page ?? 1}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Guidance cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Clock,
            light: 'bg-sky-50 dark:bg-sky-950/40',
            text: 'text-sky-500',
            title: 'Review proof carefully',
            desc: 'Confirm links, screenshots, and posts match what the listing promised.',
          },
          {
            icon: CheckCircle2,
            light: 'bg-emerald-50 dark:bg-emerald-950/40',
            text: 'text-emerald-500',
            title: 'Verify real delivery',
            desc: 'Approval releases escrow — only confirm when the artist has received the service.',
          },
          {
            icon: XCircle,
            light: 'bg-red-50 dark:bg-red-950/40',
            text: 'text-red-500',
            title: 'Reject with clarity',
            desc: 'Give a specific reason so the refund trail stays understandable for all parties.',
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
    </div>
  );
}
