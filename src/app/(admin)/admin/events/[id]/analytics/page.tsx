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
  available: number
}

interface DailyBreakdown {
  date: string
  tickets_sold: number
  revenue: number
}

interface AnalyticsResponse {
  success: boolean
  data: {
    event_id: number
    status: string
    tickets_sold: number
    total_attendees: number
    interested_count: number
    check_ins: number
    revenue: number
    revenue_credits: number
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
      label: 'Revenue',
      value: formatCurrency(analytics.revenue),
      icon: DollarSign,
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
      icon: BadgePercent,
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            </div>
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
                      <p className="font-semibold">{formatCurrency(tier.revenue)}</p>
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
