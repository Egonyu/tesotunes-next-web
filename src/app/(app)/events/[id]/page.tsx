'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Heart,
  Bookmark,
  ChevronLeft,
  ExternalLink,
  Globe,
  Star,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEvent, type EventTicketTier } from '@/hooks/useEvents'
import { toast } from 'sonner'
import { SocialProof } from '@/components/events/SocialProof'
import { TicketSelector } from '@/components/events/TicketSelector'
import { GroupBookingCTA } from '@/components/events/GroupBookingCTA'
import { ShareButtons } from '@/components/events/ShareButtons'
function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatTimeRange(start?: string, end?: string) {
  const s = formatTime(start)
  const e = formatTime(end)
  if (s && e) return `${s} - ${e}`
  return s || 'TBA'
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: event, isLoading, error } = useEvent(id)
  const [isInterested, setIsInterested] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container py-16 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This event may have been removed or does not exist.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Browse Events
        </Link>
      </div>
    )
  }

  const isPastEvent = event.starts_at
    ? new Date(event.starts_at) < new Date()
    : event.date
      ? new Date(event.date) < new Date()
      : false

  const totalSold =
    event.ticket_tiers?.reduce(
      (sum: number, t: EventTicketTier) => sum + (t.quantity_sold || 0),
      0,
    ) || 0
  const totalCapacity =
    event.ticket_tiers?.reduce(
      (sum: number, t: EventTicketTier) => sum + (t.quantity || 0),
      0,
    ) || event.attendee_limit || event.capacity || 0
  const isSoldOut = totalCapacity > 0 && totalSold >= totalCapacity

  function handleInterest() {
    setIsInterested(!isInterested)
    toast.success(isInterested ? 'Removed from interests' : 'Added to interests')
  }

  function handleBookmark() {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? 'Bookmark removed' : 'Event saved')
  }

  function handleProceedToCheckout() {
    router.push(`/events/${id}/checkout`)
  }
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={
            event.artwork ||
            event.banner ||
            event.banner_image ||
            event.image ||
            '/images/illustrations/default-event.jpg'
          }
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <Link
          href="/events"
          className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-colors z-10"
        >
          <ChevronLeft className="h-4 w-4" />
          Events
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {event.category && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full capitalize">
                  {event.category}
                </span>
              )}
              {event.status === 'cancelled' && (
                <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                  Cancelled
                </span>
              )}
              {event.status === 'completed' && (
                <span className="px-3 py-1 bg-gray-500 text-white text-sm rounded-full">
                  Completed
                </span>
              )}
              {event.is_featured && (
                <span className="px-3 py-1 bg-yellow-500 text-black text-sm rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> Featured
                </span>
              )}
              {isSoldOut && (
                <span className="px-3 py-1 bg-red-500/90 text-white text-sm rounded-full">
                  Sold Out
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(event.starts_at || event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>
                  {formatTimeRange(
                    event.starts_at || event.date,
                    event.ends_at || event.end_date,
                  )}
                </span>
              </div>
              {event.is_virtual ? (
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>Online Event</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.venue_name || event.location_name || event.venue || event.city || event.location_city || 'TBA'}</span>
                </div>
              )}
              {totalSold > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{totalSold.toLocaleString()} going</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleInterest}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-medium',
                  isInterested
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'hover:bg-muted',
                )}
              >
                <Heart className={cn('h-4 w-4', isInterested && 'fill-primary')} />
                {isInterested ? 'Interested' : 'Interested?'}
              </button>
              <button
                onClick={handleBookmark}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-medium',
                  isBookmarked
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600'
                    : 'hover:bg-muted',
                )}
              >
                <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-yellow-500')} />
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
              <ShareButtons title={event.title} />
            </div>

            {/* About */}
            <section>
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </section>

            {/* Artist */}
            {event.artist && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Performing Artist</h2>
                <Link
                  href={`/artists/${event.artist.slug || event.artist.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted transition-colors"
                >
                  <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted">
                    {event.artist.image ? (
                      <Image
                        src={event.artist.image}
                        alt={event.artist.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xl font-bold text-muted-foreground">
                        {event.artist.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{event.artist.name}</p>
                    <p className="text-sm text-muted-foreground">View artist profile</p>
                  </div>
                </Link>
              </section>
            )}

            {/* Venue */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                {event.is_virtual ? 'Online Event' : 'Venue & Location'}
              </h2>
              <div className="p-5 rounded-xl border">
                {event.is_virtual ? (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">This is an online event</p>
                      {event.virtual_link ? (
                        <a
                          href={event.virtual_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                        >
                          Join Online <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          Link will be shared closer to the event
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {event.venue_name || event.location_name || event.venue || 'Venue TBA'}
                      </p>
                      {(event.venue_address || event.location_address) && (
                        <p className="text-muted-foreground text-sm">
                          {event.venue_address || event.location_address}
                        </p>
                      )}
                      <p className="text-muted-foreground text-sm">
                        {[event.city || event.location_city, event.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
            {/* Event Details Grid */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailCard
                  icon={<Calendar className="h-5 w-5 text-primary" />}
                  label="Date"
                  value={formatDate(event.starts_at || event.date)}
                />
                <DetailCard
                  icon={<Clock className="h-5 w-5 text-primary" />}
                  label="Time"
                  value={formatTimeRange(
                    event.starts_at || event.date,
                    event.ends_at || event.end_date,
                  )}
                />
                {(event.attendee_limit || event.capacity) && (
                  <DetailCard
                    icon={<Users className="h-5 w-5 text-primary" />}
                    label="Capacity"
                    value={`${(event.attendee_limit || event.capacity)?.toLocaleString()} attendees`}
                  />
                )}
                {event.timezone && (
                  <DetailCard
                    icon={<Globe className="h-5 w-5 text-primary" />}
                    label="Timezone"
                    value={event.timezone}
                  />
                )}
              </div>
            </section>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <section>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(event.tags) ? event.tags : []).map(
                    (tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-muted text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ),
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <SocialProof event={event} />

              {event.ticket_tiers && event.ticket_tiers.length > 0 ? (
                <TicketSelector
                  tiers={event.ticket_tiers}
                  eventId={event.id}
                  isPastEvent={isPastEvent}
                  isCancelled={event.status === 'cancelled'}
                  onProceedToCheckout={handleProceedToCheckout}
                />
              ) : (
                <div className="p-6 rounded-xl border bg-card">
                  <h2 className="text-lg font-semibold mb-4">Tickets</h2>
                  {event.is_free ? (
                    <div className="text-center py-4">
                      <p className="text-2xl font-bold text-green-500 mb-2">Free Event</p>
                      <p className="text-sm text-muted-foreground">
                        No tickets required - just show up!
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Tickets not yet available. Check back soon.
                    </p>
                  )}
                </div>
              )}

              {!isPastEvent && !isSoldOut && event.status !== 'cancelled' && (
                <GroupBookingCTA eventId={event.id} />
              )}

              {event.organizer && (
                <div className="p-4 rounded-xl border">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                    Organized by
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                      {event.organizer.avatar ? (
                        <Image
                          src={event.organizer.avatar}
                          alt={event.organizer.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                          {event.organizer.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{event.organizer.name}</p>
                      <p className="text-xs text-muted-foreground">Event Organizer</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback: show organizer_name if no organizer object */}
              {!event.organizer && event.organizer_name && (
                <div className="p-4 rounded-xl border">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                    Organized by
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                      <div className="h-full w-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                        {event.organizer_name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{event.organizer_name}</p>
                      <p className="text-xs text-muted-foreground">Event Organizer</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  )
}
