'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Heart,
  Share2,
  Ticket,
  TrendingUp,
  Zap,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getEventImage,
  getEventStartDate,
  getEventTimeLabel,
  getEventVenueLabel,
  type Event as HookEvent,
} from '@/hooks/useEvents'

// Flexible Event type that works with both hook and enhanced types
type EventLike = HookEvent

interface EventCardProps {
  event: EventLike
  featured?: boolean
  showSocialProof?: boolean
  showLiveData?: boolean
  enableQuickActions?: boolean
  compact?: boolean
  className?: string
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    month: d.toLocaleDateString('en', { month: 'short' }),
    day: d.getDate(),
    weekday: d.toLocaleDateString('en', { weekday: 'short' }),
    full: d.toLocaleDateString('en', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
  }
}

function formatPrice(event: EventLike) {
  const tiers = event.ticket_tiers
  if (!tiers || tiers.length === 0) return { label: 'Free', isFree: true }
  if (tiers.every((t) => t.price === 0 || t.is_free))
    return { label: 'Free', isFree: true }

  const prices = tiers.map((t) => t.price).filter((p) => p > 0)
  const min = Math.min(...prices)
  const max = Math.max(...prices)

  return {
    label:
      min === max
        ? `UGX ${min.toLocaleString()}`
        : `UGX ${min.toLocaleString()} - ${max.toLocaleString()}`,
    isFree: false,
  }
}

export function EventCard({
  event,
  featured = false,
  showSocialProof = false,
  showLiveData = false,
  enableQuickActions = false,
  compact = false,
  className,
}: EventCardProps) {
  const dateStr = getEventStartDate(event)
  const eventDate = dateStr ? formatEventDate(dateStr) : null
  const isPast = dateStr ? new Date(dateStr) < new Date() : false
  const price = formatPrice(event)
  const imageUrl = getEventImage(event)
  const totalAttending = event.attendee_count || event.tickets_sold || 0
  const hypeScore = (event as unknown as Record<string, unknown>).hype_score as number | undefined

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        'group block rounded-xl overflow-hidden border bg-card hover:shadow-xl transition-all duration-300',
        featured && 'md:flex md:h-80',
        compact && 'h-auto',
        className,
      )}
    >
      {/* Image */}
      <div
        className={cn(
          'relative overflow-hidden',
          featured ? 'md:w-1/2 h-52 md:h-full' : 'h-52',
          compact && 'h-36',
        )}
      >
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Date Badge */}
        {eventDate && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg p-2 text-center min-w-[56px] shadow-md">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              {eventDate.month}
            </p>
            <p className="text-xl font-bold text-gray-900 leading-none">
              {eventDate.day}
            </p>
            <p className="text-[10px] text-gray-500 uppercase">
              {eventDate.weekday}
            </p>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {event.is_featured && (
            <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded-full uppercase tracking-wider">
              Featured
            </span>
          )}
          {isPast && (
            <span className="px-2 py-0.5 bg-gray-600 text-white text-[10px] font-semibold rounded-full">
              Past
            </span>
          )}
          {event.status === 'cancelled' && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full">
              Cancelled
            </span>
          )}
        </div>

        {/* Hype Meter */}
        {showLiveData && hypeScore && hypeScore > 50 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
            <Flame className="h-3.5 w-3.5" />
            <span>Trending</span>
          </div>
        )}

        {/* Live Tickets Remaining */}
        {showLiveData && event.ticket_tiers && (
          <LiveTicketBadge tiers={event.ticket_tiers} />
        )}

        {/* Category */}
        {event.category && !compact && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full capitalize">
              {event.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'p-4',
          featured && 'md:w-1/2 md:p-6 flex flex-col justify-center',
          compact && 'p-3',
        )}
      >
        <h3
          className={cn(
            'font-semibold group-hover:text-primary transition-colors line-clamp-2',
            featured ? 'text-xl md:text-2xl' : 'text-base',
            compact && 'text-sm',
          )}
        >
          {event.title}
        </h3>

        {featured && event.description && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
            {event.description}
          </p>
        )}

        <div
          className={cn(
            'flex flex-col gap-1.5 mt-2 text-sm text-muted-foreground',
            compact && 'text-xs gap-1',
          )}
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {getEventVenueLabel(event)}
            </span>
          </div>
          {!compact && dateStr && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{getEventTimeLabel(event)}</span>
            </div>
          )}
          {totalAttending > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{totalAttending.toLocaleString()} attending</span>
            </div>
          )}
        </div>

        {/* Social Proof */}
        {showSocialProof && totalAttending > 10 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, totalAttending))].map((_, i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/60 to-primary border-2 border-card"
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              +{Math.max(0, totalAttending - 3)} going
            </span>
          </div>
        )}

        {/* Artist */}
        {event.artist && !compact && (
          <div className="flex items-center gap-2 mt-2">
            <div className="relative h-6 w-6 rounded-full border border-primary/30 overflow-hidden bg-muted">
              {event.artist.image ? (
                <Image
                  src={event.artist.image}
                  alt={event.artist.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex items-center justify-center h-full text-[10px] font-bold">
                  {event.artist.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {event.artist.name}
            </span>
          </div>
        )}

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div>
            {price.isFree ? (
              <span className="font-bold text-green-500 text-sm">Free</span>
            ) : (
              <span className="font-bold text-sm">{price.label}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {enableQuickActions && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <Heart className="h-4 w-4" />
              </button>
            )}
            <span className="flex items-center gap-1 text-xs text-primary font-medium">
              <Ticket className="h-3.5 w-3.5" />
              Tickets
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function LiveTicketBadge({
  tiers,
}: {
  tiers: EventLike['ticket_tiers']
}) {
  if (!tiers || tiers.length === 0) return null
  const totalAvailable = tiers.reduce((sum, t) => sum + (t.available ?? 0), 0)
  const totalCapacity = tiers.reduce(
    (sum, t) => sum + (t.quantity_total ?? t.quantity ?? 0),
    0,
  )

  if (totalCapacity === 0) return null
  const percentSold = ((totalCapacity - totalAvailable) / totalCapacity) * 100

  if (percentSold < 70) return null

  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full animate-pulse">
      <Zap className="h-3.5 w-3.5" />
      {totalAvailable <= 0 ? 'Sold Out' : `${totalAvailable} left`}
    </div>
  )
}

export default EventCard
