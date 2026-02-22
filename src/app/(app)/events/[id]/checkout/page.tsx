'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Loader2,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEvent, useInitiateCheckout, useCompleteCheckout } from '@/hooks/useEvents'
import { useEventCartStore } from '@/stores/events'
import { OrderSummary } from '@/components/events/OrderSummary'
import { PaymentMethodSelector } from '@/components/events/PaymentMethodSelector'
import { DiscountCodeInput } from '@/components/events/DiscountCodeInput'
import { toast } from 'sonner'

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [step, setStep] = useState<'review' | 'payment' | 'processing' | 'success'>('review')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [creditsEarned, setCreditedEarned] = useState(0)

  const { data: event, isLoading: eventLoading } = useEvent(id)
  const {
    items,
    paymentMethod,
    total,
    subtotal,
    discountCode,
    creditsToUse,
    clearCart,
  } = useEventCartStore()

  const initiateCheckout = useInitiateCheckout()
  const completeCheckout = useCompleteCheckout()

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
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    const needsPhone = ['mtn_momo', 'airtel_money'].includes(paymentMethod)
    if (needsPhone && !phoneNumber) {
      toast.error('Please enter your phone number')
      return
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
        credits_to_use: creditsToUse || undefined,
      })

      // Step 2: Complete — pass first cart item's ticket info to the purchase endpoint
      const firstItem = items[0]
      const result = await completeCheckout.mutateAsync({
        event_id: Number(id),
        checkout_id: checkout.checkout_id,
        payment_provider: paymentMethod,
        payment_details: {
          phone_number: phoneNumber,
        },
        phone_number: phoneNumber || undefined,
        ticket_tier_id: firstItem.ticket_tier_id,
        quantity: firstItem.quantity,
      })

      setOrderId(result.data?.order_id || null)
      setCreditedEarned(0)
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
          <Link
            href="/tickets"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            View My Tickets
            <ArrowRight className="h-4 w-4" />
          </Link>
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
                    {event.venue_name || event.venue || event.city || 'TBA'}
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

              {/* Discount Code */}
              <DiscountCodeInput />

              <button
                onClick={() => setStep('payment')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
              >
                Continue to Payment
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {step === 'payment' && (
            <>
              {/* Payment Method */}
              <PaymentMethodSelector
                creditsBalance={0}
                onSelect={() => {}}
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
                  Pay UGX {total.toLocaleString()}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-24">
            <OrderSummary />
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
