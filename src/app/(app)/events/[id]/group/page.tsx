'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Clock3,
  ArrowRight,
  Ticket,
} from 'lucide-react'
import { useEvent, getEventVenueLabel } from '@/hooks/useEvents'
import { useEventCartStore } from '@/stores/events'
import type { EventTicketTier as StoreTicketTier } from '@/types/events'

export default function GroupBookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: event, isLoading } = useEvent(id)
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(2)
  const { clearCart, setEventId, addToCart } = useEventCartStore()

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

  const resolvedEvent = event

  const availableTiers = (resolvedEvent.ticket_tiers || []).filter((tier) => (tier.available ?? 0) > 0)
  const selectedTier =
    availableTiers.find((tier) => tier.id === (selectedTierId ?? availableTiers[0]?.id)) || availableTiers[0]

  function handleStartGroupLeadCheckout() {
    if (!selectedTier) {
      return
    }

    clearCart()
    setEventId(resolvedEvent.id)
    addToCart(
      { ...selectedTier, event_id: resolvedEvent.id, description: selectedTier.description || '', is_active: selectedTier.is_active ?? true, quantity_total: selectedTier.quantity_total ?? selectedTier.quantity ?? 0, created_at: resolvedEvent.created_at, updated_at: resolvedEvent.updated_at } as unknown as StoreTicketTier,
      Math.max(2, Math.min(quantity, selectedTier.max_per_order, selectedTier.available ?? quantity)),
    )
    router.push(`/events/${id}/checkout?group_lead=1`)
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
            {resolvedEvent.title} at {getEventVenueLabel(resolvedEvent)}
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
              <h2 className="text-xl font-semibold">Group lead booking is live</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                One person can now handle the booking for a group, choose the ticket
                tier, reserve multiple seats, and assign attendee names during
                checkout. This is the MVP path while split payments and invite
                coordination stay out of scope.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="font-medium">Live today</p>
                <p className="text-muted-foreground mt-1">
                  A group lead can book multiple tickets in one Tesotunes order and
                  assign each attendee before payment.
                </p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="font-medium">Still planned</p>
                <p className="text-muted-foreground mt-1">
                  Split payments, invite links, member confirmations, and
                  group-specific discounts.
                </p>
              </div>
            </div>

            {selectedTier ? (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_auto]">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Ticket tier</label>
                    <select
                      value={selectedTier.id}
                      onChange={(e) => setSelectedTierId(Number(e.target.value))}
                      className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                    >
                      {availableTiers.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.name} • UGX {(tier.price_ugx || tier.price || 0).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Seats</label>
                    <input
                      type="number"
                      min={2}
                      max={Math.min(selectedTier.max_per_order, selectedTier.available ?? selectedTier.max_per_order)}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleStartGroupLeadCheckout}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Ticket className="h-4 w-4" />
                      Continue
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Next step: checkout will ask for each attendee name so tickets are issued correctly from the start.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                No group-lead booking tiers are currently available for this event.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {selectedTier && (
                <button
                  onClick={handleStartGroupLeadCheckout}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
                >
                  Start Group Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
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
