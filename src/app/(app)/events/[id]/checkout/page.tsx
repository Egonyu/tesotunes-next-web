'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  ChevronLeft,
  Loader2,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getEventVenueLabel,
  type TicketQuote,
  useEvent,
  useSavedAttendeeProfiles,
  useInitiateCheckout,
  useCompleteCheckout,
  useValidateDiscountCode,
} from '@/hooks/useEvents'
import { useEventCartStore } from '@/stores/events'
import { OrderSummary } from '@/components/events/OrderSummary'
import { PaymentMethodSelector } from '@/components/events/PaymentMethodSelector'
import { DiscountCodeInput } from '@/components/events/DiscountCodeInput'
import { toast } from 'sonner'

interface AttendeeAssignmentRow {
  key: string
  ticketTierId: number
  tierName: string
  ticketIndex: number
  name: string
  email: string
  phone: string
  saveProfile: boolean
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'review' | 'payment' | 'processing' | 'success'>('review')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [creditsEarned, setCreditsEarned] = useState(0)
  const [quote, setQuote] = useState<TicketQuote | null>(null)
  const [attendeeRows, setAttendeeRows] = useState<AttendeeAssignmentRow[]>([])
  const [guestBuyerName, setGuestBuyerName] = useState('')
  const [guestBuyerEmail, setGuestBuyerEmail] = useState('')
  const [guestBuyerPhone, setGuestBuyerPhone] = useState('')

  const { status: sessionStatus } = useSession()
  const isAuthenticated = sessionStatus === 'authenticated'
  const isGuestCheckout = sessionStatus !== 'authenticated'
  const { data: event, isLoading: eventLoading } = useEvent(id)
  const { data: savedAttendeeProfiles = [] } = useSavedAttendeeProfiles(10, isAuthenticated)
  const {
    items,
    paymentMethod,
    total,
    discountCode,
    clearCart,
    setPaymentMethod,
  } = useEventCartStore()

  const initiateCheckout = useInitiateCheckout()
  const completeCheckout = useCompleteCheckout()
  const validateDiscountCode = useValidateDiscountCode()
  const attribution = {
    source: searchParams.get('source') || searchParams.get('utm_source') || searchParams.get('ref') || undefined,
    channel: searchParams.get('channel') || searchParams.get('utm_medium') || undefined,
    campaign_code: searchParams.get('campaign_code') || searchParams.get('campaign') || searchParams.get('promo') || undefined,
    referral_code: searchParams.get('referral_code') || searchParams.get('ref') || undefined,
    promoter_code: searchParams.get('promoter_code') || searchParams.get('promoter') || undefined,
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    utm_term: searchParams.get('utm_term') || undefined,
    utm_content: searchParams.get('utm_content') || undefined,
    landing_page: `/events/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
  }

  useEffect(() => {
    setAttendeeRows((current) => {
      const currentByKey = new Map(current.map((row) => [row.key, row]))
      const nextRows: AttendeeAssignmentRow[] = []

      items.forEach((item) => {
        Array.from({ length: item.quantity }).forEach((_, index) => {
          const key = `${item.ticket_tier_id}-${index}`
          nextRows.push(currentByKey.get(key) ?? {
            key,
            ticketTierId: item.ticket_tier_id,
            tierName: item.ticket_tier.name,
            ticketIndex: index,
            name: '',
            email: '',
            phone: '',
            saveProfile: true,
          })
        })
      })

      return nextRows
    })
  }, [items])

  useEffect(() => {
    if (isGuestCheckout && (paymentMethod === 'wallet' || paymentMethod === 'credits')) {
      setPaymentMethod('mtn_momo')
    }
  }, [isGuestCheckout, paymentMethod, setPaymentMethod])

  const updateAttendeeRow = (key: string, field: keyof AttendeeAssignmentRow, value: string | boolean) => {
    setAttendeeRows((current) => current.map((row) => (
      row.key === key ? { ...row, [field]: value } : row
    )))
  }

  const applySavedProfile = (key: string, profileIndex: number) => {
    const profile = savedAttendeeProfiles[profileIndex]
    if (!profile) return

    setAttendeeRows((current) => current.map((row) => (
      row.key === key
        ? {
            ...row,
            name: profile.name || row.name,
            email: profile.email || '',
            phone: profile.phone || '',
            saveProfile: true,
          }
        : row
    )))
  }

  const buildAttendeeAssignments = () => {
    const grouped = new Map<number, Array<{ name?: string; email?: string; phone?: string; save_profile?: boolean }>>()

    attendeeRows.forEach((row) => {
      const attendees = grouped.get(row.ticketTierId) ?? []
      attendees.push({
        name: row.name || undefined,
        email: row.email || undefined,
        phone: row.phone || undefined,
        save_profile: row.saveProfile,
      })
      grouped.set(row.ticketTierId, attendees)
    })

    return Array.from(grouped.entries()).map(([ticketTierId, attendees]) => ({
      ticket_tier_id: ticketTierId,
      attendees,
    }))
  }

  if (eventLoading) {
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
        <Link
          href="/events"
          className="text-primary hover:underline"
        >
          Browse Events
        </Link>
      </div>
    )
  }

  if (event.ticketing_mode === 'external_only') {
    return (
      <div className="container py-16 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Checkout Happens Off Tesotunes</h2>
        <p className="text-muted-foreground mb-6">
          This event uses organizer-managed ticketing, so Tesotunes checkout is not available for it.
        </p>
        <Link
          href={`/events/${id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Event
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Tickets Selected</h2>
        <p className="text-muted-foreground mb-6">
          Please select tickets before proceeding to checkout.
        </p>
        <Link
          href={`/events/${id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Event
        </Link>
      </div>
    )
  }

  async function handleCheckout() {
    const missingNames = attendeeRows.filter((row) => row.name.trim() === '')
    if (missingNames.length > 0) {
      toast.error('Add a ticket holder name for each ticket before paying')
      setStep('review')
      return
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    const needsPhone = ['mtn_momo', 'airtel_money'].includes(paymentMethod)
    if (needsPhone && !phoneNumber) {
      toast.error('Please enter your phone number')
      return
    }

    if (isGuestCheckout) {
      if (!guestBuyerName.trim() || !guestBuyerEmail.trim()) {
        toast.error('Enter your name and email to continue as a guest')
        return
      }

      if (paymentMethod === 'wallet' || paymentMethod === 'credits') {
        toast.error('Guest checkout currently supports MTN or Airtel payments only')
        return
      }
    }

    setStep('processing')

    try {
      // Step 1: Initiate
      const checkout = await initiateCheckout.mutateAsync({
        event_id: Number(id),
        tickets: items.map((item) => ({
          ticket_tier_id: item.ticket_tier_id,
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        discount_code: discountCode || undefined,
        attribution,
      })
      setQuote(checkout.quote)

      const result = await completeCheckout.mutateAsync({
        event_id: Number(id),
        checkout_id: checkout.checkout_id,
        payment_provider: paymentMethod,
        payment_details: {
          phone_number: phoneNumber,
        },
        phone_number: phoneNumber || undefined,
        discount_code: discountCode || undefined,
        tickets: items.map((item) => ({
          ticket_tier_id: item.ticket_tier_id,
          quantity: item.quantity,
        })),
        holder_name: isGuestCheckout ? guestBuyerName.trim() : undefined,
        holder_email: isGuestCheckout ? guestBuyerEmail.trim() : undefined,
        holder_phone: isGuestCheckout ? (guestBuyerPhone.trim() || phoneNumber || undefined) : undefined,
        attendee_assignments: buildAttendeeAssignments(),
        attribution,
      })

      setOrderId(result.data?.order_id || null)
      setCreditsEarned(0)
      setStep('success')
      clearCart()
    } catch (err: unknown) {
      setStep('payment')
      const message = err instanceof Error ? err.message : 'Checkout failed. Please try again.'
      toast.error(message)
    }
  }

  if (step === 'success') {
    return (
      <div className="container py-16 max-w-lg mx-auto text-center">
        <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-2">
          Your tickets for <span className="font-semibold text-foreground">{event.title}</span> are confirmed.
        </p>
        {isGuestCheckout && (
          <p className="text-sm text-muted-foreground mb-4">
            We used your guest details to issue the tickets. Keep your order ID handy until full guest ticket retrieval lands.
          </p>
        )}
        {orderId && (
          <p className="text-sm text-muted-foreground mb-4">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        )}
        {creditsEarned > 0 && (
          <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm font-medium mb-6">
            You earned {creditsEarned.toLocaleString()} credits for this purchase!
          </div>
        )}
        <div className="flex flex-col gap-3">
          {isAuthenticated ? (
            <Link
              href="/tickets"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
            >
              View My Tickets
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={`/events/${id}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
            >
              Back to Event
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/events"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="container py-16 max-w-lg mx-auto text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
        <h2 className="text-xl font-bold mb-2">Processing Payment...</h2>
        <p className="text-muted-foreground text-sm">
          Please wait while we process your payment. Do not close this page.
        </p>
        {paymentMethod === 'mtn_momo' || paymentMethod === 'airtel_money' ? (
          <p className="text-sm text-primary mt-4">
            Check your phone for a payment prompt.
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-5xl">
      {/* Back */}
      <Link
        href={`/events/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Event
      </Link>

      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        <StepIndicator
          step={1}
          label="Review"
          active={step === 'review'}
          completed={step === 'payment'}
        />
        <div className="h-px flex-1 bg-border" />
        <StepIndicator
          step={2}
          label="Payment"
          active={step === 'payment'}
          completed={false}
        />
      </div>

      <h1 className="text-2xl font-bold mb-6">
        {step === 'review' ? 'Review Your Order' : 'Complete Payment'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {step === 'review' && (
            <>
              {/* Event Summary */}
              <div className="p-4 rounded-xl border bg-card flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-primary">
                    {event.starts_at
                      ? new Date(event.starts_at).getDate()
                      : '?'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getEventVenueLabel(event)}
                  </p>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="p-4 rounded-xl border bg-card space-y-3">
                <h3 className="font-semibold text-sm">Your Tickets</h3>
                {items.map((item) => (
                  <div
                    key={item.ticket_tier_id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {item.ticket_tier.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        x{item.quantity} @ UGX{' '}
                        {item.unit_price.toLocaleString()} each
                      </p>
                    </div>
                    <p className="font-bold text-sm">
                      UGX {item.subtotal.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-sm">Assign Ticket Holders</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add the actual attendee details for each ticket so Tesotunes issues the right names from the start.
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {attendeeRows.length} ticket holder{attendeeRows.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {attendeeRows.map((row) => (
                    <div key={row.key} className="rounded-xl border bg-muted/20 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-sm">{row.tierName}</p>
                          <p className="text-xs text-muted-foreground">Ticket {row.ticketIndex + 1}</p>
                        </div>
                        {savedAttendeeProfiles.length > 0 && (
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value !== '') {
                                applySavedProfile(row.key, Number(e.target.value))
                                e.currentTarget.value = ''
                              }
                            }}
                            className="rounded-lg border bg-background px-3 py-2 text-xs"
                          >
                            <option value="">Quick fill from saved attendee</option>
                            {savedAttendeeProfiles.slice(0, 5).map((profile, index) => (
                              <option key={`${profile.name}-${profile.email || index}`} value={index}>
                                {profile.name}{profile.email ? ` • ${profile.email}` : ''}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateAttendeeRow(row.key, 'name', e.target.value)}
                          placeholder="Ticket holder name"
                          className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                        />
                        <input
                          type="email"
                          value={row.email}
                          onChange={(e) => updateAttendeeRow(row.key, 'email', e.target.value)}
                          placeholder="Email (optional)"
                          className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                        />
                        <input
                          type="tel"
                          value={row.phone}
                          onChange={(e) => updateAttendeeRow(row.key, 'phone', e.target.value)}
                          placeholder="Phone (optional)"
                          className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                        />
                      </div>

                      <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={row.saveProfile}
                          onChange={(e) => updateAttendeeRow(row.key, 'saveProfile', e.target.checked)}
                        />
                        Save this attendee for faster checkout next time
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-4">
                <DiscountCodeInput
                  onApply={async (code) => {
                    const response = await validateDiscountCode.mutateAsync({
                      event_id: Number(id),
                      code,
                      tickets: items.map((item) => ({
                        ticket_tier_id: item.ticket_tier_id,
                        quantity: item.quantity,
                      })),
                    })

                    setQuote(response.data.quote)

                    return {
                      valid: response.valid,
                      discount: response.data.discount_amount,
                      message: response.message,
                    }
                  }}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Event promo codes apply live Tesotunes quote math before payment, so your fees and final total stay accurate.
                </p>
              </div>

              <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                Multi-tier orders, promo codes, and attendee assignment are already live here.
                Guest checkout is MVP right now, so guest buyers use MTN or Airtel while Tesotunes wallet and credits stay signed-in only.
              </div>

              <div className="rounded-xl border bg-card p-4 text-sm">
                <p className="font-medium">Before you pay</p>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <p>Refunds: {event.refund_policy || 'Tickets are non-refundable unless the organizer or event terms say otherwise.'}</p>
                  <p>Organizer: {event.organizer?.name || 'Tesotunes event organizer'}</p>
                  <p>Support: {event.contact_info?.support_email || event.contact_info?.support_phone || 'Contact details will appear on your ticket after purchase.'}</p>
                  {discountCode && <div>Promo code: {discountCode}</div>}
                </div>
              </div>

              {(attribution.campaign_code || attribution.referral_code || attribution.utm_source) && (
                <div className="rounded-xl border bg-card p-4 text-sm">
                  <p className="font-medium">Tracked promotion</p>
                  <p className="mt-1 text-muted-foreground">
                    {attribution.campaign_code || attribution.referral_code || attribution.utm_source}
                  </p>
                </div>
              )}

              <button
                onClick={async () => {
                try {
                  const checkout = await initiateCheckout.mutateAsync({
                   event_id: Number(id),
                   tickets: items.map((item) => ({
                      ticket_tier_id: item.ticket_tier_id,
                      quantity: item.quantity,
                     })),
                     payment_method: paymentMethod,
                     discount_code: discountCode || undefined,
                     attribution,
                   })
                  setQuote(checkout.quote)
                  setStep('payment')
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : 'Failed to prepare checkout'
                  toast.error(message)
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
            >
                Continue to Payment
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {step === 'payment' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Organizer credibility</p>
                      <div className="mt-2 space-y-1 text-muted-foreground">
                        <p>Organizer: {event.organizer?.name || 'Tesotunes event organizer'}</p>
                        <p>Venue: {getEventVenueLabel(event)}</p>
                        <p>Support: {event.contact_info?.support_email || event.contact_info?.support_phone || 'Shared after purchase'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Receipt className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Fee transparency</p>
                      <div className="mt-2 space-y-1 text-muted-foreground">
                        <p>Base ticket total: UGX {(quote?.base_amount ?? total).toLocaleString()}</p>
                        <p>Tesotunes fees: UGX {(quote?.total_fee_amount ?? 0).toLocaleString()}</p>
                        <p>You pay: UGX {(quote?.total_amount ?? total).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isGuestCheckout && (
                <div className="rounded-xl border bg-card p-4">
                  <h3 className="font-semibold text-sm">Guest buyer details</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add the buyer details Tesotunes should use for this order. Ticket holder names stay separate above.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      value={guestBuyerName}
                      onChange={(e) => setGuestBuyerName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
                    />
                    <input
                      type="email"
                      value={guestBuyerEmail}
                      onChange={(e) => setGuestBuyerEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
                    />
                    <input
                      type="tel"
                      value={guestBuyerPhone}
                      onChange={(e) => setGuestBuyerPhone(e.target.value)}
                      placeholder="Buyer phone (optional)"
                      className="w-full rounded-lg border bg-background px-4 py-3 text-sm md:col-span-2"
                    />
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <PaymentMethodSelector
                creditsBalance={0}
                onSelect={() => {}}
                disabledMethods={isGuestCheckout ? ['wallet', 'credits'] : []}
              />

              {/* Phone Number for MoMo */}
              {(paymentMethod === 'mtn_momo' ||
                paymentMethod === 'airtel_money') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., 0771234567"
                    className="w-full px-4 py-3 rounded-lg border bg-background text-sm"
                  />
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline"
                  >
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . I understand that tickets are non-refundable unless the
                  event is cancelled.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('review')}
                  className="px-6 py-3 rounded-lg border hover:bg-muted text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={!agreedToTerms}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm',
                    agreedToTerms
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed',
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Pay UGX {(quote?.total_amount ?? total).toLocaleString()}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-24">
            <OrderSummary quote={quote} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepIndicator({
  step,
  label,
  active,
  completed,
}: {
  step: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
          active && 'bg-primary text-primary-foreground',
          completed && 'bg-green-500 text-white',
          !active && !completed && 'bg-muted text-muted-foreground',
        )}
      >
        {completed ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <span
        className={cn(
          'text-sm',
          active ? 'font-medium' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
    </div>
  )
}
