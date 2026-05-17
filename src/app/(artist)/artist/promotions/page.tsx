'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Users,
  CreditCard,
  TrendingUp,
  Star,
  BarChart3,
  Plus,
  PauseCircle,
  Play,
  Trash2,
  Edit2,
  Loader2,
  CheckCircle2,
  Clock,
  Radio,
  ChevronRight,
  Target,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import {
  useMyPromotions,
  usePausePromotion,
  useActivatePromotion,
  useDeletePromotion,
  useSellerAnalytics,
} from '@/hooks/usePromotions';
import {
  PromotionStatusBadge,
  PromotionsPagination,
} from '@/components/promotions';
import { PROMOTION_PLATFORM_LABELS, PROMOTION_TYPE_LABELS } from '@/types/promotions';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'paused', label: 'Paused' },
  { value: 'draft', label: 'Draft' },
  { value: 'rejected', label: 'Rejected' },
];

const STAT_CARDS = [
  {
    key: 'active_promotions',
    label: 'Active Services',
    icon: Megaphone,
    light: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-500',
  },
  {
    key: 'total_orders',
    label: 'Total Orders',
    icon: Users,
    light: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-500',
  },
  {
    key: 'total_revenue_credits',
    label: 'Revenue',
    icon: CreditCard,
    light: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-500',
  },
  {
    key: 'net_revenue_credits',
    label: 'Net Revenue',
    icon: TrendingUp,
    light: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-500',
  },
  {
    key: 'average_rating',
    label: 'Avg Rating',
    icon: Star,
    light: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-500',
  },
  {
    key: 'settled_orders',
    label: 'Settled',
    icon: BarChart3,
    light: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-500',
  },
];

export default function ArtistPromotionsPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useMyPromotions({ status: status || undefined, page });
  const { data: analytics } = useSellerAnalytics();
  const pause = usePausePromotion();
  const activate = useActivatePromotion();
  const remove = useDeletePromotion();

  const getTypeLabel = (v: string) =>
    PROMOTION_TYPE_LABELS[v as keyof typeof PROMOTION_TYPE_LABELS] ?? v.replace(/_/g, ' ');
  const getPlatformLabel = (v: string) =>
    PROMOTION_PLATFORM_LABELS[v as keyof typeof PROMOTION_PLATFORM_LABELS] ?? v.replace(/_/g, ' ');

  function getStatValue(key: string): string {
    if (!analytics) return '—';
    const val = analytics[key as keyof typeof analytics] as number;
    if (key === 'average_rating') return val.toFixed(1);
    if (key === 'total_revenue_credits' || key === 'net_revenue_credits') {
      return formatNumber(val) + ' cr';
    }
    return formatNumber(val);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
          <p className="text-sm text-muted-foreground">
            Manage your promotion services and track earnings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/artist/promotions/profile"
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            My Profile
          </Link>
          <Link
            href="/artist/promotions/orders"
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Orders
          </Link>
          <Link
            href="/artist/promotions/create"
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Service
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map(({ key, label, icon: Icon, light, text }) => (
          <div key={key} className="rounded-xl bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', light)}>
                <Icon className={cn('h-4 w-4', text)} />
              </span>
            </div>
            <p className="text-2xl font-bold">{getStatValue(key)}</p>
            {key === 'total_revenue_credits' && analytics && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatCurrency(analytics.total_revenue_ugx)}
              </p>
            )}
            {key === 'net_revenue_credits' && analytics && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatCurrency(analytics.net_revenue_ugx)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_272px]">
        {/* Services list */}
        <div className="rounded-xl bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">My Services</h2>
              <p className="text-xs text-muted-foreground">Filter and manage your listings</p>
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
            ) : !data?.data?.length ? (
              <div className="py-12 text-center">
                <Megaphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="font-medium">No services yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first promotion service to start earning
                </p>
                <Link
                  href="/artist/promotions/create"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Create Service
                </Link>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {data.data.map((promo) => (
                    <div
                      key={promo.id}
                      className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <PromotionStatusBadge status={promo.status} />
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {getTypeLabel(promo.type)}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {getPlatformLabel(promo.platform)}
                          </span>
                        </div>
                        <h3 className="truncate font-medium">{promo.title}</h3>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {promo.short_description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            <span className="font-medium text-foreground">
                              {promo.price_credits} cr
                            </span>{' '}
                            / {formatCurrency(promo.price_ugx)}
                          </span>
                          <span>
                            {promo.completed_orders}/{promo.total_orders} orders
                          </span>
                          <span>{formatNumber(promo.estimated_reach)} reach</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {promo.rating_average.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {confirmDeleteId === promo.id ? (
                          <>
                            <span className="mr-1 text-xs text-muted-foreground">Delete?</span>
                            <button
                              onClick={() =>
                                remove.mutate(promo.id, {
                                  onSuccess: () => setConfirmDeleteId(null),
                                })
                              }
                              disabled={remove.isPending}
                              className="rounded-md bg-destructive px-3 py-1.5 text-xs text-white hover:bg-destructive/90 disabled:opacity-50"
                            >
                              {remove.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                'Yes'
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                            >
                              No
                            </button>
                          </>
                        ) : (
                          <>
                            {promo.status === 'active' && (
                              <button
                                onClick={() => pause.mutate(promo.id)}
                                disabled={pause.isPending}
                                className="rounded-lg p-2 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                title="Pause"
                              >
                                <PauseCircle className="h-4 w-4 text-amber-500" />
                              </button>
                            )}
                            {promo.status === 'paused' && (
                              <button
                                onClick={() => activate.mutate(promo.id)}
                                disabled={activate.isPending}
                                className="rounded-lg p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                title="Activate"
                              >
                                <Play className="h-4 w-4 text-emerald-500" />
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmDeleteId(promo.id)}
                              className="rounded-lg p-2 hover:bg-destructive/10"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => router.push(`/artist/promotions/${promo.id}/edit`)}
                              className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <PromotionsPagination
                  currentPage={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Quick Actions</h3>
            <div className="space-y-1">
              {[
                {
                  href: '/artist/promotions/create',
                  icon: Plus,
                  light: 'bg-violet-50 dark:bg-violet-950/40',
                  text: 'text-violet-500',
                  label: 'Create New Service',
                },
                {
                  href: '/artist/promotions/orders',
                  icon: CheckCircle2,
                  light: 'bg-sky-50 dark:bg-sky-950/40',
                  text: 'text-sky-500',
                  label: 'Review Orders',
                },
                {
                  href: '/artist/promotions/profile',
                  icon: Star,
                  light: 'bg-emerald-50 dark:bg-emerald-950/40',
                  text: 'text-emerald-500',
                  label: 'Edit My Profile',
                },
                {
                  href: '/artist/promotions/analytics',
                  icon: BarChart3,
                  light: 'bg-amber-50 dark:bg-amber-950/40',
                  text: 'text-amber-500',
                  label: 'View Analytics',
                },
                {
                  href: '/artist/promotions/opportunities/create',
                  icon: Target,
                  light: 'bg-sky-50 dark:bg-sky-950/40',
                  text: 'text-sky-500',
                  label: 'Post Opportunity',
                },
              ].map(({ href, icon: Icon, light, text, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-lg p-2.5 text-sm hover:bg-muted"
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      light
                    )}
                  >
                    <Icon className={cn('h-4 w-4', text)} />
                  </span>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">What Sells Best</h3>
            <div className="space-y-3">
              {[
                {
                  icon: Megaphone,
                  light: 'bg-violet-50 dark:bg-violet-950/40',
                  text: 'text-violet-500',
                  title: 'Short-form creators',
                  desc: 'Lead with follower quality, niche, and exactly what the artist gets.',
                },
                {
                  icon: Radio,
                  light: 'bg-sky-50 dark:bg-sky-950/40',
                  text: 'text-sky-500',
                  title: 'Radio & DJ slots',
                  desc: 'Make slots, spin count, and proof terms very explicit.',
                },
                {
                  icon: Clock,
                  light: 'bg-orange-50 dark:bg-orange-950/40',
                  text: 'text-orange-500',
                  title: 'Fast response rate',
                  desc: 'Promoters who reply within 2h get 3x more bookings.',
                },
              ].map(({ icon: Icon, light, text, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                      light
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5', text)} />
                  </span>
                  <div>
                    <p className="text-xs font-medium">{title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
