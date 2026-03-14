'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  Users,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Clock3,
} from 'lucide-react'
import { useEvent, getEventVenueLabel } from '@/hooks/useEvents'

export default function GroupBookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: event, isLoading } = useEvent(id)

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-16 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <Link href="/events" className="text-primary hover:underline">
          Browse Events
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <Link
        href={`/events/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Event
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Group Booking</h1>
          <p className="text-sm text-muted-foreground">
            {event.title} at {getEventVenueLabel(event)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Clock3 className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">This flow is planned, not live yet</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                Group invites, shared payment coordination, automatic seat pooling,
                and group discounts are still being standardized against the Events
                API. We’ve left this page in place so the product direction is
                visible, but it no longer pretends checkout is available before the
                backend contract exists.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="font-medium">Live today</p>
                <p className="text-muted-foreground mt-1">
                  Single-tier event checkout, ticket validation, attendee tracking,
                  public artist event pages, and admin event actions.
                </p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="font-medium">Still planned</p>
                <p className="text-muted-foreground mt-1">
                  Group invites, split payment rules, shared codes, discount logic,
                  and coordinated seat claiming.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/events/${id}/tickets`}
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
              >
                Continue With Standard Checkout
              </Link>
              <Link
                href={`/events/${id}`}
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg border hover:bg-muted text-sm"
              >
                Back to Event
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
