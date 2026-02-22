'use client'

import { useState } from 'react'
import { Tag, Loader2, CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEventCartStore } from '@/stores/events'
import { toast } from 'sonner'

interface DiscountCodeInputProps {
  onApply?: (code: string) => Promise<{ valid: boolean; discount: number; message: string }>
  className?: string
}

export function DiscountCodeInput({
  onApply,
  className,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const { setDiscountCode, applyDiscount, discountAmount } =
    useEventCartStore()

  async function handleApply() {
    if (!code.trim()) return

    setIsApplying(true)
    try {
      if (onApply) {
        const result = await onApply(code.trim())
        if (result.valid) {
          setDiscountCode(code.trim())
          applyDiscount(result.discount)
          setApplied(true)
          toast.success(result.message || 'Discount applied!')
        } else {
          toast.error(result.message || 'Invalid discount code')
        }
      } else {
        // Demo mode - simulate validation
        setDiscountCode(code.trim())
        toast.info('Discount code saved - will be validated at checkout')
        setApplied(true)
      }
    } catch {
      toast.error('Failed to validate discount code')
    } finally {
      setIsApplying(false)
    }
  }

  function handleRemove() {
    setCode('')
    setDiscountCode('')
    applyDiscount(0)
    setApplied(false)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Discount Code
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            disabled={applied}
            className={cn(
              'w-full px-3 py-2 rounded-lg border bg-background text-sm uppercase',
              applied && 'bg-green-50 border-green-300 dark:bg-green-950/20 dark:border-green-800',
            )}
          />
          {applied && (
            <button
              onClick={handleRemove}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {!applied && (
          <button
            onClick={handleApply}
            disabled={!code.trim() || isApplying}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              code.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            {isApplying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </button>
        )}
      </div>

      {applied && discountAmount > 0 && (
        <p className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="h-3.5 w-3.5" />
          Saving UGX {discountAmount.toLocaleString()}
        </p>
      )}
    </div>
  )
}

export default DiscountCodeInput
