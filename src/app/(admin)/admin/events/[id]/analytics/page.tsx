'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  BarChart3,
  BadgePercent,
  CalendarDays,
  DollarSign,
  Download,
  Ticket,
  Users,
} from 'lucide-react'
import { apiGet } from '@/lib/api'

interface TierBreakdown {
  id: number
  name: string
  sold: number
  total: number | null
  revenue: number
  estimated_organizer_payout: number
  tesotunes_fee_revenue: number
  available: number
}

interface DailyBreakdown {
  date: string
  tickets_sold: number
  revenue: number
  customer_paid_total: number
  estimated_organizer_payout: number
  tesotunes_fee_revenue: number
}

interface AnalyticsResponse {
  success: boolean
  data: {
    event_id: number
    status: string
    tickets_sold: number
    confirmed_orders: number
    total_attendees: number
    interested_count: number
    check_ins: number
    revenue: number
    gross_revenue: number
    customer_paid_total: number
    revenue_credits: number
    tesotunes_fee_revenue: number
    platform_commission_revenue: number
    processing_fee_revenue: number
    estimated_organizer_payout: number
    average_order_value: number
    fee_contract_coverage: {
      orders_with_fee_breakdown: number
      legacy_orders_without_fee_breakdown: number
    }
    payouts: {
      pending_balance: number
      ready_balance: number
      settled_balance: number
      failed_balance: number
      entry_count: number
      status_breakdown: {
        pending: number
        ready: number
        paid: number
        failed: number
      }
      latest_ready_at?: string | null
      latest_paid_out_at?: string | null
    }
    marketing: {
      attributed_orders: number
      unattributed_orders: number
      attributed_revenue: number
      top_sources: Array<{
        source: string
        channel?: string | null
        campaign_code?: string | null
        referral_code?: string | null
        orders: number
        tickets_sold: number
        gross_revenue: number
        customer_paid_total: number
        estimated_organizer_payout: number
        tesotunes_fee_revenue: number
      }>
    }
    sales_channels: {
      channels: Array<{
        key: 'tesotunes_native' | 'tracked_promo' | 'manual_offline' | 'external'
        label: string
        orders: number
        tickets_sold: number
        gross_revenue: number
        customer_paid_total: number
        estimated_organizer_payout: number
        tesotunes_fee_revenue: number
        order_share_percent: number
      }>
    }
    roi: {
      total_spend: number
      total_gross_revenue: number
      total_organizer_payout: number
      total_net_profit: number
      tracked_sources: number
      by_source: Array<{
        key: string
        label: string
        channel?: string | null
        campaign_code?: string | null
        referral_code?: string | null
        orders: number
        tickets_sold: number
        spend: number
        gross_revenue: number
        customer_paid_total: number
        estimated_organizer_payout: number
        tesotunes_fee_revenue: number
        net_profit: number
        roas: number | null
        payout_roi_percent: number | null
        notes?: string | null
      }>
    }
    settlements: {
      event_totals: {
        gross_revenue: number
        organizer_net_amount: number
        settled_balance: number
        failed_balance: number
      }
      by_tier: Array<{
        tier: string
        sold: number
        gross_revenue: number
        organizer_net_amount: number
        tesotunes_fee_revenue: number
      }>
      by_campaign: Array<{
        label: string
        channel?: string | null
        campaign_code?: string | null
        referral_code?: string | null
        orders: number
        tickets_sold: number
        gross_revenue: number
        customer_paid_total: number
        tesotunes_fee_revenue: number
        organizer_net_amount: number
      }>
      by_payout_cycle: Array<{
        cycle_date?: string | null
        entry_count: number
        gross_revenue: number
        customer_paid_total: number
        tesotunes_fee_revenue: number
        organizer_net_amount: number
        dominant_status: string
      }>
    }
    conversion_rate: number
    sell_through_rate: number
    by_tier: TierBreakdown[]
    by_date: DailyBreakdown[]
  }
}

function formatCurrency(amount: number) {
  return `UGX ${amount.toLocaleString()}`
}

export default function AdminEventAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'events', id, 'analytics'],
    queryFn: () => apiGet<AnalyticsResponse>(`/admin/events/${id}/analytics`),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  const analytics = data?.data
  if (!analytics) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
        Analytics are not available for this event yet.
      </div>
    )
  }

  const cards = [
    {
      label: 'Organizer Payout',
      value: formatCurrency(analytics.estimated_organizer_payout),
      icon: DollarSign,
    },
    {
      label: 'Customer Paid',
      value: formatCurrency(analytics.customer_paid_total),
      icon: DollarSign,
    },
    {
      label: 'Tesotunes Fees',
      value: formatCurrency(analytics.tesotunes_fee_revenue),
      icon: BadgePercent,
    },
    {
      label: 'Tickets Sold',
      value: analytics.tickets_sold.toLocaleString(),
      icon: Ticket,
    },
    {
      label: 'Interested',
      value: analytics.interested_count.toLocaleString(),
      icon: Users,
    },
    {
      label: 'Conversion',
      value: `${analytics.conversion_rate.toFixed(1)}%`,
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/events/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to event
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Event Analytics</h1>
        <p className="text-muted-foreground">
          Ticket sales, attendance, and conversion metrics for this event.
        </p>
        <div className="mt-4">
          <a
            href={`/api/backend/admin/events/${id}/analytics/export`}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Export payout CSV
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border bg-card p-5"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <card.icon className="h-4 w-4" />
              {card.label}
            </div>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">Sales Timeline</h2>
          </div>
          {analytics.by_date.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              No confirmed sales have been recorded yet.
            </div>
          ) : (
            <div className="divide-y">
              {analytics.by_date.map((point) => (
                <div
                  key={point.date}
                  className="flex items-center justify-between px-5 py-4 text-sm"
                >
                  <div className="inline-flex items-center gap-2 font-medium">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {new Date(point.date).toLocaleDateString()}
                  </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(point.revenue)}</p>
                      <p className="text-muted-foreground">{point.tickets_sold} tickets</p>
                      <p className="text-xs text-muted-foreground">
                        Fees {formatCurrency(point.tesotunes_fee_revenue)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Attendance Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmed attendees</span>
                <span className="font-medium">{analytics.total_attendees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmed orders</span>
                <span className="font-medium">{analytics.confirmed_orders.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Checked in</span>
                <span className="font-medium">{analytics.check_ins.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sell-through rate</span>
                <span className="font-medium">{analytics.sell_through_rate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue in credits</span>
                <span className="font-medium">{analytics.revenue_credits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average order value</span>
                <span className="font-medium">{formatCurrency(analytics.average_order_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee contract coverage</span>
                <span className="font-medium">
                  {analytics.fee_contract_coverage.orders_with_fee_breakdown}/
                  {analytics.confirmed_orders}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Revenue Split</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross ticket revenue</span>
                <span className="font-medium">{formatCurrency(analytics.gross_revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform commission</span>
                <span className="font-medium">{formatCurrency(analytics.platform_commission_revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing fees</span>
                <span className="font-medium">{formatCurrency(analytics.processing_fee_revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated organizer payout</span>
                <span className="font-semibold">{formatCurrency(analytics.estimated_organizer_payout)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Payout Ledger</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending balance</span>
                <span className="font-medium">{formatCurrency(analytics.payouts.pending_balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ready balance</span>
                <span className="font-medium">{formatCurrency(analytics.payouts.ready_balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid out</span>
                <span className="font-medium">{formatCurrency(analytics.payouts.settled_balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Failed balance</span>
                <span className="font-medium">{formatCurrency(analytics.payouts.failed_balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ledger entries</span>
                <span className="font-medium">{analytics.payouts.entry_count.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Promotion Attribution</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Attributed orders</span>
                <span className="font-medium">{analytics.marketing.attributed_orders.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unattributed orders</span>
                <span className="font-medium">{analytics.marketing.unattributed_orders.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Attributed revenue</span>
                <span className="font-medium">{formatCurrency(analytics.marketing.attributed_revenue)}</span>
              </div>
            </div>
            {analytics.marketing.top_sources.length > 0 ? (
              <div className="mt-4 space-y-3">
                {analytics.marketing.top_sources.slice(0, 5).map((source) => (
                  <div key={source.source} className="rounded-xl bg-muted/40 p-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{source.source}</p>
                        <p className="text-muted-foreground">
                          {source.orders} orders and {source.tickets_sold} tickets
                        </p>
                        {(source.channel || source.campaign_code || source.referral_code) && (
                          <p className="text-xs text-muted-foreground">
                            {[source.channel, source.campaign_code, source.referral_code].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(source.gross_revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          Payout {formatCurrency(source.estimated_organizer_payout)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fees {formatCurrency(source.tesotunes_fee_revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No tracked promotion sources have converted yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Sales Channels</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Compare Tesotunes-native sales with tracked promo, manual/offline, and external volume.
            </p>
            <div className="mt-4 space-y-3">
              {analytics.sales_channels.channels.map((channel) => (
                <div key={channel.key} className="rounded-xl bg-muted/40 p-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{channel.label}</p>
                      <p className="text-muted-foreground">
                        {channel.orders} orders and {channel.tickets_sold} tickets
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {channel.order_share_percent.toFixed(1)}% of confirmed orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(channel.gross_revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        Payout {formatCurrency(channel.estimated_organizer_payout)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fees {formatCurrency(channel.tesotunes_fee_revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Source ROI</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracked spend</span>
                <span className="font-medium">{formatCurrency(analytics.roi.total_spend)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross revenue</span>
                <span className="font-medium">{formatCurrency(analytics.roi.total_gross_revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organizer payout</span>
                <span className="font-medium">{formatCurrency(analytics.roi.total_organizer_payout)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net profit after spend</span>
                <span className="font-medium">{formatCurrency(analytics.roi.total_net_profit)}</span>
              </div>
            </div>

            {analytics.roi.by_source.length > 0 ? (
              <div className="mt-4 space-y-3">
                {analytics.roi.by_source.slice(0, 5).map((source) => (
                  <div key={source.key} className="rounded-xl bg-muted/40 p-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{source.label}</p>
                        <p className="text-muted-foreground">
                          {source.orders} orders and {source.tickets_sold} tickets
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Spend {formatCurrency(source.spend)}
                          {source.notes ? ` • ${source.notes}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(source.net_profit)}</p>
                        <p className="text-xs text-muted-foreground">
                          Payout {formatCurrency(source.estimated_organizer_payout)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {source.roas !== null ? `${source.roas.toFixed(2)}x ROAS` : 'No spend recorded'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No source-level ROI rows are available yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Settlement Reports</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net event settlement value</span>
                <span className="font-medium">{formatCurrency(analytics.settlements.event_totals.organizer_net_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Settled balance</span>
                <span className="font-medium">{formatCurrency(analytics.settlements.event_totals.settled_balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Failed balance</span>
                <span className="font-medium">{formatCurrency(analytics.settlements.event_totals.failed_balance)}</span>
              </div>
            </div>

            {analytics.settlements.by_campaign.length > 0 ? (
              <div className="mt-4 space-y-3">
                {analytics.settlements.by_campaign.slice(0, 4).map((campaign) => (
                  <div key={campaign.label} className="rounded-xl bg-muted/40 p-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{campaign.label}</p>
                        <p className="text-muted-foreground">
                          {campaign.orders} orders and {campaign.tickets_sold} tickets
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(campaign.organizer_net_amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          Gross {formatCurrency(campaign.gross_revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {analytics.settlements.by_payout_cycle.length > 0 ? (
              <div className="mt-4 space-y-3">
                {analytics.settlements.by_payout_cycle.slice(0, 4).map((cycle, index) => (
                  <div key={`${cycle.cycle_date || 'unassigned'}-${index}`} className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-sm">
                    <div>
                      <p className="font-medium">
                        {cycle.cycle_date ? new Date(cycle.cycle_date).toLocaleDateString() : 'Unassigned cycle'}
                      </p>
                      <p className="text-muted-foreground">
                        {cycle.entry_count} entries • {cycle.dominant_status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(cycle.organizer_net_amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        Fees {formatCurrency(cycle.tesotunes_fee_revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="inline-flex items-center gap-2 font-semibold">
                <BarChart3 className="h-4 w-4" />
                Tier Breakdown
              </h2>
            </div>
            {analytics.by_tier.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                No ticket tiers found for this event.
              </div>
            ) : (
              <div className="divide-y">
                {analytics.by_tier.map((tier) => (
                  <div
                    key={tier.id}
                    className="px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{tier.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {tier.sold} sold
                          {tier.total !== null ? ` of ${tier.total}` : ''} and {tier.available} remaining
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(tier.revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          Payout {formatCurrency(tier.estimated_organizer_payout)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
