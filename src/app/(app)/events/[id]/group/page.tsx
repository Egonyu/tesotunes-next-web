'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Copy,
  CheckCircle,
  Clock,
  Percent,
  Gift,
  ChevronLeft,
  Loader2,
  AlertCircle,
  UserPlus,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEvent, useCreateGroupBooking } from '@/hooks/useEvents'
import { toast } from 'sonner'

export default function GroupBookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: event, isLoading } = useEvent(id)
  const createGroup = useCreateGroupBooking()

  const [step, setStep] = useState<'setup' | 'created'>('setup')
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [totalSeats, setTotalSeats] = useState(5)
  const [paymentSplit, setPaymentSplit] = useState<'equal' | 'custom' | 'organizer_pays'>('equal')
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)

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

  const tiers = event.ticket_tiers || []
  const selectedTierData = tiers.find((t) => t.id === selectedTier)

  const discountPercent = totalSeats >= 10 ? 20 : totalSeats >= 5 ? 10 : 0
  const pricePerPerson = selectedTierData
    ? Math.round(
        (selectedTierData.price_ugx || selectedTierData.price || 0) *
          (1 - discountPercent / 100),
      )
    : 0
  const totalAmount = pricePerPerson * totalSeats

  async function handleCreateGroup() {
    if (!selectedTier || totalSeats < 2) {
      toast.error('Select a ticket tier and at least 2 seats')
      return
    }

    try {
      const result = await createGroup.mutateAsync({
        event_id: Number(id),
        ticket_tier_id: selectedTier,
        total_seats: totalSeats,
        payment_split: paymentSplit,
      })

      setInviteLink(result.invite_link)
      setInviteCode(result.invite_code)
      setStep('created')
      toast.success('Group booking created!')
    } catch {
      toast.error('Failed to create group booking')
    }
  }

  async function copyInviteLink() {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Invite link copied!')
    }
  }

  if (step === 'created') {
    return (
      <div className="container py-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Group Created!</h1>
          <p className="text-muted-foreground">
            Share this link with your friends to join the group
          </p>
        </div>

        {/* Invite Link */}
        <div className="p-6 rounded-xl border bg-card space-y-4">
          <h3 className="font-semibold">Invite Link</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink || ''}
              readOnly
              className="flex-1 px-4 py-2.5 rounded-lg border bg-muted text-sm font-mono"
            />
            <button
              onClick={copyInviteLink}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 text-sm"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>

          {inviteCode && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Or share this code:
              </p>
              <p className="text-2xl font-mono font-bold text-primary tracking-widest">
                {inviteCode}
              </p>
            </div>
          )}
        </div>

        {/* Group Details */}
        <div className="p-6 rounded-xl border bg-card mt-4 space-y-3">
          <h3 className="font-semibold">Group Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">Event</p>
              <p className="font-medium">{event.title}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">Seats</p>
              <p className="font-medium">{totalSeats}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">Per Person</p>
              <p className="font-medium">UGX {pricePerPerson.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">Discount</p>
              <p className="font-medium text-green-500">{discountPercent}% off</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link
            href={`/events/${id}`}
            className="flex-1 text-center px-6 py-3 rounded-lg border hover:bg-muted text-sm"
          >
            Back to Event
          </Link>
          <Link
            href="/tickets"
            className="flex-1 text-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          >
            View My Tickets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
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
            {event.title} — Save more with friends
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Setup Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Select Ticket Tier */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">1. Select Ticket Type</h3>
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                disabled={(tier.available ?? 0) <= 0}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-lg border transition-all text-left',
                  selectedTier === tier.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted',
                  (tier.available ?? 0) <= 0 && 'opacity-50 cursor-not-allowed',
                )}
              >
                <div>
                  <p className="font-medium">{tier.name}</p>
                  {tier.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {tier.description}
                    </p>
                  )}
                </div>
                <p className="font-bold text-sm">
                  UGX {(tier.price_ugx || tier.price || 0).toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          {/* Group Size */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">2. Group Size</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={2}
                max={30}
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <div className="w-16 text-center">
                <span className="text-2xl font-bold">{totalSeats}</span>
                <p className="text-xs text-muted-foreground">people</p>
              </div>
            </div>
            {discountPercent > 0 && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Percent className="h-4 w-4" />
                {discountPercent}% group discount applied!
              </p>
            )}
          </div>

          {/* Payment Split */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">3. Payment Split</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'equal' as const,
                  label: 'Split Equally',
                  desc: 'Everyone pays the same',
                  icon: Users,
                },
                {
                  id: 'custom' as const,
                  label: 'Custom Split',
                  desc: 'Set amounts per person',
                  icon: CreditCard,
                },
                {
                  id: 'organizer_pays' as const,
                  label: 'I Pay All',
                  desc: 'Cover the full cost',
                  icon: Gift,
                },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPaymentSplit(option.id)}
                  className={cn(
                    'p-4 rounded-lg border text-left transition-all',
                    paymentSplit === option.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted',
                  )}
                >
                  <option.icon className="h-5 w-5 text-primary mb-2" />
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateGroup}
            disabled={!selectedTier || createGroup.isPending}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium',
              selectedTier
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            {createGroup.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create Group & Get Invite Link
              </>
            )}
          </button>
        </div>

        {/* Sidebar - Pricing */}
        <div>
          <div className="sticky top-24 space-y-4">
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-semibold mb-4">Group Pricing</h3>

              <div className="space-y-3">
                {selectedTierData ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ticket</span>
                      <span>{selectedTierData.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Original price
                      </span>
                      <span>
                        UGX{' '}
                        {(
                          selectedTierData.price_ugx ||
                          selectedTierData.price ||
                          0
                        ).toLocaleString()}
                      </span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Group discount</span>
                        <span>-{discountPercent}%</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Per person
                      </span>
                      <span className="font-bold">
                        UGX {pricePerPerson.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold">
                      <span>Total ({totalSeats} people)</span>
                      <span>UGX {totalAmount.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select a ticket type to see pricing
                  </p>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="p-4 rounded-xl border bg-gradient-to-br from-green-500/5 to-green-500/10">
              <h4 className="font-semibold text-sm mb-3">Group Benefits</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  <span>Automatic group discounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  <span>Easy payment coordination</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  <span>Organizer earns 5% credit cashback</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  <span>Share link with friends to join</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
