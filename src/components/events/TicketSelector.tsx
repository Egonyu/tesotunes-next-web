'use client'

import {
  Ticket,
  Minus,
  Plus,
  CreditCard,
  Coins,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEventCartStore } from '@/stores/events'
import type { EventTicketTier } from '@/hooks/useEvents'
import type { EventTicketTier as StoreTicketTier } from '@/types/events'
import { toast } from 'sonner'

interface TicketSelectorProps {
  tiers: EventTicketTier[]
  eventId: number
  isPastEvent?: boolean
  isCancelled?: boolean
  waitlistCount?: number
  waitlistJoined?: boolean
  isJoiningWaitlist?: boolean
  onJoinWaitlist?: () => void
  onProceedToCheckout?: () => void
  className?: string
}

export function TicketSelector({
  tiers,
  eventId,
  isPastEvent = false,
  isCancelled = false,
  waitlistCount = 0,
  waitlistJoined = false,
  isJoiningWaitlist = false,
  onJoinWaitlist,
  onProceedToCheckout,
  className,
}: TicketSelectorProps) {
  const { items, addToCart, removeFromCart, setEventId, total } =
    useEventCartStore()

  const isSoldOut = tiers.every((t) => (t.available ?? 0) <= 0)
  const allFree = tiers.every((t) => t.price === 0 || t.is_free)

  if (isCancelled) {
    return (
      <div className={cn('p-6 rounded-xl border bg-card', className)}>
        <h2 className="text-lg font-semibold mb-4">Tickets</h2>
        <div className="text-center py-6">
          <p className="text-lg font-medium text-red-500">Event Cancelled</p>
          <p className="text-sm text-muted-foreground mt-1">
            This event has been cancelled.
          </p>
        </div>
      </div>
    )
  }

  if (isPastEvent) {
    return (
      <div className={cn('p-6 rounded-xl border bg-card', className)}>
        <h2 className="text-lg font-semibold mb-4">Tickets</h2>
        <p className="text-muted-foreground text-center py-4">
          This event has already ended.
        </p>
      </div>
    )
  }

  if (isSoldOut) {
    return (
      <div className={cn('p-6 rounded-xl border bg-card', className)}>
        <h2 className="text-lg font-semibold mb-4">Tickets</h2>
        <div className="text-center py-6">
          <p className="text-lg font-medium text-red-500">Sold Out</p>
          <p className="text-sm text-muted-foreground mt-1">
            All tickets have been sold.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {waitlistCount > 0 ? `${waitlistCount} fan${waitlistCount === 1 ? '' : 's'} already on the waitlist.` : 'Join the waitlist to get notified if inventory opens up.'}
          </p>
          {onJoinWaitlist && (
            <button
              onClick={onJoinWaitlist}
              disabled={waitlistJoined || isJoiningWaitlist}
              className={cn(
                'mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                waitlistJoined
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
                isJoiningWaitlist && 'opacity-70'
              )}
            >
              {waitlistJoined ? 'On Waitlist' : isJoiningWaitlist ? 'Joining Waitlist...' : 'Notify Me'}
            </button>
          )}
        </div>
      </div>
    )
  }

  const cartForEvent = items.filter(
    (item) =>
      tiers.some((t) => t.id === item.ticket_tier_id),
  )
  const totalQuantity = cartForEvent.reduce((sum, item) => sum + item.quantity, 0)

  function handleQuantityChange(
    tier: EventTicketTier,
    delta: number,
  ) {
    setEventId(eventId)
    const existing = items.find((i) => i.ticket_tier_id === tier.id)
    const currentQty = existing?.quantity ?? 0
    const newQty = Math.max(0, Math.min(currentQty + delta, tier.max_per_order, tier.available ?? tier.quantity))

    if (newQty === 0) {
      removeFromCart(tier.id)
    } else {
      addToCart({ ...tier, price_ugx: tier.price_ugx ?? tier.price ?? 0 } as unknown as StoreTicketTier, newQty)
    }
  }

  return (
    <div className={cn('p-6 rounded-xl border bg-card', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {allFree ? 'Registration' : 'Select Tickets'}
        </h2>
        {!allFree && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure checkout
          </div>
        )}
      </div>

      <div className="space-y-3">
        {tiers.map((tier) => {
          const cartItem = items.find(
            (i) => i.ticket_tier_id === tier.id,
          )
          const qty = cartItem?.quantity ?? 0
          const available = tier.available ?? 0
          const isTierSoldOut = available <= 0

          return (
            <div
              key={tier.id}
              className={cn(
                'p-4 rounded-lg border transition-all',
                qty > 0 && 'border-primary bg-primary/5',
                isTierSoldOut && 'opacity-50',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{tier.name}</p>
                    {tier.required_loyalty_tier && (
                      <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 text-[10px] rounded-full font-semibold flex items-center gap-0.5">
                        <Star className="h-3 w-3" />
                        {tier.required_loyalty_tier}+
                      </span>
                    )}
                  </div>
                  {tier.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {tier.description}
                    </p>
                  )}
                  {tier.tier_early_access_hours && tier.tier_early_access_hours > 0 && (
                    <p className="text-[10px] text-primary mt-1 font-medium">
                      {tier.tier_early_access_hours}h early access
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {tier.is_free || tier.price === 0 ? (
                    <p className="font-bold text-green-500">Free</p>
                  ) : (
                    <>
                      <p className="font-bold text-sm">
                        UGX{' '}
                        {(tier.price_ugx || tier.price || 0).toLocaleString()}
                      </p>
                      {(tier.price_credits ?? 0) > 0 && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                          <Coins className="h-3 w-3" />
                          {tier.price_credits?.toLocaleString()} credits
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
                <div className="text-xs text-muted-foreground">
                  {isTierSoldOut ? (
                    <span className="text-red-500 font-medium">Sold out</span>
                  ) : available < 50 ? (
                    <span className="text-orange-500 font-medium">
                      {available} left
                    </span>
                  ) : (
                    <span>Available</span>
                  )}
                </div>

                {!isTierSoldOut && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(tier, -1)}
                      disabled={qty === 0}
                      className={cn(
                        'h-8 w-8 rounded-full border flex items-center justify-center transition-colors',
                        qty === 0
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-muted',
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(tier, 1)}
                      disabled={
                        qty >= tier.max_per_order ||
                        qty >= available
                      }
                      className={cn(
                        'h-8 w-8 rounded-full border flex items-center justify-center transition-colors',
                        qty >= tier.max_per_order || qty >= available
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-primary hover:text-primary-foreground hover:border-primary',
                      )}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart Summary + Checkout */}
      {totalQuantity > 0 && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {totalQuantity} ticket{totalQuantity !== 1 ? 's' : ''}
            </span>
            <span className="font-bold">
              {allFree ? 'Free' : `UGX ${total.toLocaleString()}`}
            </span>
          </div>

          <button
            onClick={() => {
              if (onProceedToCheckout) {
                onProceedToCheckout()
              } else {
                toast.info('Checkout flow coming soon')
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Ticket className="h-5 w-5" />
            {allFree ? 'Register Now' : 'Proceed to Checkout'}
          </button>

          {!allFree && (
            <div className="space-y-2 text-center text-[10px] text-muted-foreground">
              <p>Add multiple tiers to one Tesotunes checkout. One payment still applies per order.</p>
              <div className="flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Wallet and card
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="h-3 w-3" /> Mobile money and credits
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TicketSelector
