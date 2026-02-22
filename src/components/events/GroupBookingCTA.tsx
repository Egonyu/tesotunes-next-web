'use client'

import { Users, ArrowRight, Gift, Percent } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GroupBookingCTAProps {
  eventId: number | string
  className?: string
}

export function GroupBookingCTA({ eventId, className }: GroupBookingCTAProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10',
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Going with friends?</h3>
          <p className="text-xs text-muted-foreground">
            Save more with group bookings
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Percent className="h-3.5 w-3.5 text-green-500" />
          <span>
            <span className="font-medium text-foreground">5-9 people</span> -
            10% off each ticket
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Percent className="h-3.5 w-3.5 text-green-500" />
          <span>
            <span className="font-medium text-foreground">10+ people</span> -
            20% off each ticket
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Gift className="h-3.5 w-3.5 text-primary" />
          <span>
            Organizer earns{' '}
            <span className="font-medium text-foreground">5% credit cashback</span>
          </span>
        </div>
      </div>

      <Link
        href={`/events/${eventId}/group`}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border-2 border-primary text-primary font-medium text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <Users className="h-4 w-4" />
        Create Group Booking
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default GroupBookingCTA
