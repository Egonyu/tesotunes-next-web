'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BadgeCheck, Mail, Phone, Ticket, Users } from 'lucide-react'
import { apiGet } from '@/lib/api'

interface EventAttendee {
  id: number
  ticket_number: string
  status: string
  payment_status: string | null
  quantity: number
  amount_paid: number
  checked_in_at: string | null
  confirmed_at: string | null
  created_at: string | null
  attendee: {
    name: string | null
    email: string | null
    phone: string | null
  }
  ticket: {
    id: number
    name: string
    price_ugx: number
  } | null
}

interface AttendeesResponse {
  success: boolean
  data: EventAttendee[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

function formatCurrency(amount: number) {
  return `UGX ${amount.toLocaleString()}`
}

export default function AdminEventAttendeesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'events', id, 'attendees'],
    queryFn: () => apiGet<AttendeesResponse>(`/admin/events/${id}/attendees`),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  const attendees = data?.data ?? []
  const total = data?.meta.total ?? 0
  const checkedIn = attendees.filter((attendee) => attendee.checked_in_at).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/admin/events/${id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to event
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Event Attendees</h1>
          <p className="text-muted-foreground">
            Review registrations, payment state, and check-ins for this event.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Registered</p>
          <p className="mt-2 text-3xl font-bold">{total.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Checked In</p>
          <p className="mt-2 text-3xl font-bold">{checkedIn.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Page Size</p>
          <p className="mt-2 text-3xl font-bold">{(data?.meta.per_page ?? 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Attendee List</h2>
        </div>

        {attendees.length === 0 ? (
          <div className="px-5 py-16 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 h-12 w-12 opacity-50" />
            No attendees have registered yet.
          </div>
        ) : (
          <div className="divide-y">
            {attendees.map((attendee) => (
              <div
                key={attendee.id}
                className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{attendee.attendee.name || 'Guest attendee'}</p>
                    {attendee.checked_in_at ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <BadgeCheck className="h-3 w-3" />
                        Checked in
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {attendee.attendee.email ? (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {attendee.attendee.email}
                      </span>
                    ) : null}
                    {attendee.attendee.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {attendee.attendee.phone}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="inline-flex items-center gap-1 font-medium">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    {attendee.ticket?.name || 'Ticket'}
                  </p>
                  <p className="text-muted-foreground">{attendee.ticket_number}</p>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium capitalize">{attendee.status.replace(/_/g, ' ')}</p>
                  <p className="text-muted-foreground capitalize">
                    {attendee.payment_status?.replace(/_/g, ' ') || 'Pending payment'}
                  </p>
                </div>

                <div className="space-y-1 text-right text-sm">
                  <p className="font-semibold">{formatCurrency(attendee.amount_paid)}</p>
                  <p className="text-muted-foreground">Qty {attendee.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
