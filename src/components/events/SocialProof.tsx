'use client'

import { Users, TrendingUp, Clock, Flame, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Event } from '@/hooks/useEvents'

interface SocialProofProps {
  event: Event
  className?: string
}

export function SocialProof({ event, className }: SocialProofProps) {
  const attendeeCount = event.attendee_count || event.tickets_sold || 0
  const hypeScore = (event as unknown as Record<string, unknown>).hype_score as number | undefined

  // Don't render for events with zero engagement
  if (attendeeCount === 0 && !hypeScore) return null

  return (
    <div className={cn('p-4 rounded-xl border bg-card space-y-3', className)}>
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Social Buzz
      </h3>

      {/* Hype Meter */}
      {hypeScore && hypeScore > 0 && <HypeMeter score={hypeScore} />}

      {/* Attendee Count */}
      {attendeeCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[...Array(Math.min(4, attendeeCount))].map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/80 border-2 border-card flex items-center justify-center"
              >
                <Users className="h-3.5 w-3.5 text-white" />
              </div>
            ))}
            {attendeeCount > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold">
                +{attendeeCount - 4}
              </div>
            )}
          </div>
          <div className="text-sm">
            <span className="font-semibold">
              {attendeeCount.toLocaleString()}
            </span>{' '}
            <span className="text-muted-foreground">attending</span>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2">
        {attendeeCount > 20 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span>
              <span className="font-medium">Popular</span>{' '}
              <span className="text-muted-foreground">event</span>
            </span>
          </div>
        )}
        {event.is_featured && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 text-xs">
            <Flame className="h-3.5 w-3.5 text-yellow-500" />
            <span>
              <span className="font-medium">Featured</span>{' '}
              <span className="text-muted-foreground">pick</span>
            </span>
          </div>
        )}
      </div>

      {/* Recent activity placeholder */}
      {attendeeCount > 5 && (
        <div className="pt-2 border-t">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last ticket sold recently
          </p>
        </div>
      )}
    </div>
  )
}

function HypeMeter({ score }: { score: number }) {
  const level =
    score >= 80
      ? { label: 'On Fire', color: 'bg-red-500', textColor: 'text-red-500' }
      : score >= 60
        ? { label: 'Hot', color: 'bg-orange-500', textColor: 'text-orange-500' }
        : score >= 40
          ? { label: 'Warming Up', color: 'bg-yellow-500', textColor: 'text-yellow-500' }
          : { label: 'Gaining Traction', color: 'bg-blue-500', textColor: 'text-blue-500' }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Hype Level</span>
        <span className={cn('font-semibold', level.textColor)}>
          {level.label}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', level.color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default SocialProof
