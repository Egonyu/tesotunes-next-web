'use client'

import { useState, useMemo } from 'react'
import {
  CreditCard,
  Coins,
  Zap,
  Phone,
  ChevronRight,
  BadgeCheck,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEventCartStore } from '@/stores/events'
import type { PaymentMethod } from '@/types/events'

interface PaymentMethodSelectorProps {
  creditsBalance?: number
  onSelect: (method: PaymentMethod) => void
  className?: string
}

const PAYMENT_METHODS: Array<{
  id: PaymentMethod
  label: string
  description: string
  icon: typeof CreditCard
  color: string
}> = [
  {
    id: 'mtn_momo',
    label: 'MTN Mobile Money',
    description: 'Pay with MTN MoMo',
    icon: Phone,
    color: 'text-yellow-500',
  },
  {
    id: 'airtel_money',
    label: 'Airtel Money',
    description: 'Pay with Airtel Money',
    icon: Phone,
    color: 'text-red-500',
  },
  {
    id: 'credits',
    label: 'TesoTunes Credits',
    description: 'Pay with your credit balance',
    icon: Coins,
    color: 'text-primary',
  },
  {
    id: 'hybrid',
    label: 'Hybrid Payment',
    description: 'Split between UGX + Credits',
    icon: Zap,
    color: 'text-purple-500',
  },
  {
    id: 'card',
    label: 'Card Payment',
    description: 'Visa / Mastercard',
    icon: CreditCard,
    color: 'text-blue-500',
  },
]

export function PaymentMethodSelector({
  creditsBalance = 0,
  onSelect,
  className,
}: PaymentMethodSelectorProps) {
  const { paymentMethod, setPaymentMethod, total } = useEventCartStore()

  function handleSelect(method: PaymentMethod) {
    setPaymentMethod(method)
    onSelect(method)
  }

  const canPayWithCredits = creditsBalance >= total
  const canUseHybrid = creditsBalance > 0

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="font-semibold text-sm">Payment Method</h3>

      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const isDisabled =
            (method.id === 'credits' && !canPayWithCredits) ||
            (method.id === 'hybrid' && !canUseHybrid)

          return (
            <button
              key={method.id}
              onClick={() => !isDisabled && handleSelect(method.id)}
              disabled={isDisabled}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                paymentMethod === method.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'hover:bg-muted',
                isDisabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center',
                  paymentMethod === method.id
                    ? 'bg-primary/10'
                    : 'bg-muted',
                )}
              >
                <method.icon className={cn('h-5 w-5', method.color)} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{method.label}</p>
                <p className="text-xs text-muted-foreground">
                  {method.id === 'credits'
                    ? `Balance: ${creditsBalance.toLocaleString()} credits`
                    : method.description}
                </p>
              </div>

              {paymentMethod === method.id && (
                <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {paymentMethod === 'hybrid' && (
        <HybridPaymentSlider total={total} creditsBalance={creditsBalance} />
      )}
    </div>
  )
}

function HybridPaymentSlider({
  total,
  creditsBalance,
}: {
  total: number
  creditsBalance: number
}) {
  const { creditsToUse, setCreditsToUse, setHybridCalculation } =
    useEventCartStore()
  const maxCredits = Math.min(creditsBalance, Math.floor(total * 0.5))
  const ugxAmount = total - creditsToUse

  function handleSliderChange(value: number) {
    const credits = Math.min(value, maxCredits)
    setCreditsToUse(credits)
    setHybridCalculation({
      total_amount: total,
      ugx_amount: total - credits,
      credits_amount: credits,
      bonus_credits: Math.floor(credits * 0.1),
      savings_percent: Math.round((credits / total) * 100),
      max_credits_allowed: maxCredits,
      min_credits_required: 0,
    })
  }

  return (
    <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Credits to use</span>
        <span className="font-bold">{creditsToUse.toLocaleString()}</span>
      </div>

      <input
        type="range"
        min={0}
        max={maxCredits}
        value={creditsToUse}
        onChange={(e) => handleSliderChange(Number(e.target.value))}
        className="w-full accent-primary"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0 credits</span>
        <span>{maxCredits.toLocaleString()} credits (max 50%)</span>
      </div>

      <div className="pt-2 border-t space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">UGX payment</span>
          <span>UGX {ugxAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Credits payment</span>
          <span>{creditsToUse.toLocaleString()} credits</span>
        </div>
        {creditsToUse > 0 && (
          <div className="flex justify-between text-xs text-green-600 font-medium">
            <span>Bonus credits earned</span>
            <span>+{Math.floor(creditsToUse * 0.1).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentMethodSelector
