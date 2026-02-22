'use client'

import { Ticket, ShoppingCart, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEventCartStore } from '@/stores/events'

interface OrderSummaryProps {
  className?: string
}

export function OrderSummary({ className }: OrderSummaryProps) {
  const { items, subtotal, platformFee, discountAmount, total } =
    useEventCartStore()

  if (items.length === 0) return null

  return (
    <div className={cn('p-5 rounded-xl border bg-card', className)}>
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <ShoppingCart className="h-4 w-4" />
        Order Summary
      </h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.ticket_tier_id}
            className="flex items-center justify-between text-sm"
          >
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
        ))}

        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>UGX {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform fee (5%)</span>
            <span>UGX {platformFee.toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-UGX {discountAmount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>UGX {total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 mt-4 text-[10px] text-muted-foreground">
        <ShieldCheck className="h-3 w-3" />
        Secure payment - 100% money back guarantee
      </div>
    </div>
  )
}

export default OrderSummary
