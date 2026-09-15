'use client'

import { Ticket, ShoppingCart, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEventCartStore } from '@/stores/events'
import type { TicketQuote, TicketQuoteItem } from '@/hooks/useEvents'
import type { CartItem } from '@/types/events'

interface OrderSummaryProps {
  className?: string
  quote?: TicketQuote | null
}

export function OrderSummary({ className, quote }: OrderSummaryProps) {
  const { items, subtotal, discountAmount, total } =
    useEventCartStore()

  if (items.length === 0) return null

  // Fees are never estimated here: until the backend quote exists, the fee
  // row says so rather than showing a number the buyer won't be charged.
  const summarySubtotal = quote?.base_amount ?? subtotal
  const summaryDiscount = quote?.discount_amount ?? discountAmount
  const summaryTotal = quote?.total_amount ?? total
  const feeLabel = quote
    ? `Fees (${quote.platform_commission_percent}% platform + ${quote.processing_fee_percent}% processing)`
    : 'Fees'
  const quoteItems = quote?.items

  return (
    <div className={cn('p-5 rounded-xl border bg-card', className)}>
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <ShoppingCart className="h-4 w-4" />
        Order Summary
      </h3>

      <div className="space-y-3">
        {quoteItems
          ? quoteItems.map((item) => <QuoteSummaryRow key={item.ticket_tier_id} item={item} />)
          : items.map((item) => <CartSummaryRow key={item.ticket_tier_id} item={item} />)}

        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>UGX {summarySubtotal.toLocaleString()}</span>
          </div>
          {summaryDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-UGX {summaryDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{feeLabel}</span>
            <span className={quote ? undefined : 'text-muted-foreground'}>
              {quote ? `UGX ${quote.total_fee_amount.toLocaleString()}` : 'Shown before you pay'}
            </span>
          </div>
        </div>

        <div className="border-t pt-3 flex justify-between font-bold">
          <span>{quote ? 'Total' : 'Total before fees'}</span>
          <span>UGX {summaryTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Was "100% money back guarantee". Tickets are non-refundable unless
          the event is cancelled — the terms at checkout say so. */}
      <div className="flex items-center justify-center gap-1 mt-4 text-[10px] text-muted-foreground">
        <ShieldCheck className="h-3 w-3" />
        Secure payment
      </div>
    </div>
  )
}

function QuoteSummaryRow({ item }: { item: TicketQuoteItem }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-muted-foreground" />
        <span>
          {item.ticket_tier_name} x{item.quantity}
        </span>
      </div>
      <span className="font-medium">
        UGX {item.base_amount.toLocaleString()}
      </span>
    </div>
  )
}

function CartSummaryRow({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-muted-foreground" />
        <span>
          {item.ticket_tier.name} x{item.quantity}
        </span>
      </div>
      <span className="font-medium">
        UGX {item.subtotal.toLocaleString()}
      </span>
    </div>
  )
}

export default OrderSummary
