'use client'

import {
  Coins,
  Phone,
  Wallet,
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
  disabledMethods?: PaymentMethod[]
}

const PAYMENT_METHODS: Array<{
  id: PaymentMethod
  label: string
  description: string
  icon: typeof Wallet
  color: string
}> = [
  {
    id: 'wallet',
    label: 'TesoTunes Wallet',
    description: 'Pay instantly with your wallet balance',
    icon: Wallet,
    color: 'text-emerald-500',
  },
  {
    id: 'mtn_momo',
    label: 'ZengaPay Mobile Money',
    description: 'ZengaPay will collect payment on your phone',
    icon: Phone,
    color: 'text-green-600',
  },
  {
    id: 'credits',
    label: 'TesoTunes Credits',
    description: 'Pay with your credit balance',
    icon: Coins,
    color: 'text-primary',
  },
]

export function PaymentMethodSelector({
  creditsBalance = 0,
  onSelect,
  className,
  disabledMethods = [],
}: PaymentMethodSelectorProps) {
  const { paymentMethod, setPaymentMethod, total } = useEventCartStore()

  function handleSelect(method: PaymentMethod) {
    setPaymentMethod(method)
    onSelect(method)
  }

  const canPayWithCredits = creditsBalance >= total

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="font-semibold text-sm">Payment Method</h3>

      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const isDisabled = disabledMethods.includes(method.id)
            || (method.id === 'credits' && !canPayWithCredits)

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

      <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          ZengaPay is the only external payment rail here. Wallet and credits
          stay inside Tesotunes, while mobile money runs through ZengaPay.
        </p>
      </div>
    </div>
  )
}

export default PaymentMethodSelector
