'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Bookmark,
  ChevronLeft,
  ExternalLink,
  Globe,
  Star,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getEventCapacity,
  getEventCityLabel,
  getEventEndDate,
  getEventImage,
  getEventLocationSummary,
  getEventOrganizerName,
  getEventStartDate,
  getEventVenueLabel,
  useEvent,
  useJoinEventWaitlist,
  useTrackEventFunnel,
  type EventTicketTier,
} from '@/hooks/useEvents'
import { toast } from 'sonner'
import { isApiError } from '@/lib/api'
import { SocialProof } from '@/components/events/SocialProof'
import { TicketSelector } from '@/components/events/TicketSelector'
import { GroupBookingCTA } from '@/components/events/GroupBookingCTA'
import { ShareButtons } from '@/components/events/ShareButtons'
import { LikeButton } from '@/components/social/LikeButton'
import { FollowButton } from '@/components/social/FollowButton'
import { CommentSection } from '@/components/social/CommentSection'
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

export default function EventDetailPageClient() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: event, isLoading, error } = useEvent(id)
  const trackEventFunnel = useTrackEventFunnel(id)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistPhone, setWaitlistPhone] = useState('')
  const joinWaitlist = useJoinEventWaitlist()

  const attribution = useMemo(() => ({
    source: searchParams.get('source') || searchParams.get('utm_source') || searchParams.get('ref') || undefined,
    channel: searchParams.get('channel') || searchParams.get('utm_medium') || undefined,
    campaign_code: searchParams.get('campaign_code') || searchParams.get('campaign') || searchParams.get('promo') || undefined,
    referral_code: searchParams.get('referral_code') || searchParams.get('ref') || undefined,
    promoter_code: searchParams.get('promoter_code') || searchParams.get('promoter') || undefined,
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    landing_page: `/events/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
  }), [id, searchParams])

  useEffect(() => {
    if (!event) {
      return
    }

    const storageKey = 'tesotunes-event-funnel-session'
    const eventVisitKey = `tesotunes-event-visit:${event.id}:${attribution.campaign_code || attribution.source || 'direct'}`
    let sessionKey = window.localStorage.getItem(storageKey)

    if (!sessionKey) {
      sessionKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      window.localStorage.setItem(storageKey, sessionKey)
    }

    if (window.sessionStorage.getItem(eventVisitKey)) {
      return
    }

    window.sessionStorage.setItem(eventVisitKey, '1')
    trackEventFunnel.mutate({
      stage: 'visit',
      session_key: sessionKey,
      ...attribution,
    })
  }, [attribution, event, trackEventFunnel])

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

  const startsAt = getEventStartDate(event)
  const endsAt = getEventEndDate(event)
  const isPastEvent = startsAt ? new Date(startsAt) < new Date() : false
  const isExternalOnly = event.ticketing_mode === 'external_only'
  const isHybrid = event.ticketing_mode === 'hybrid'
  const ticketingSummary = event.ticketing_summary

  const totalSold =
    event.ticket_tiers?.reduce(
      (sum: number, t: EventTicketTier) => sum + (t.quantity_sold || 0),
      0,
    ) || 0
  const tesotunesAvailable =
    event.ticket_tiers?.reduce(
      (sum: number, t: EventTicketTier) => sum + (typeof t.available === 'number' ? t.available : 0),
      0,
    ) ?? 0
  const totalCapacity =
    event.ticket_tiers?.reduce(
      (sum: number, t: EventTicketTier) => sum + (t.quantity || 0),
      0,
    ) || getEventCapacity(event) || 0
  const hasTicketTiers = (event.ticket_tiers?.length || 0) > 0
  const isSoldOut = hasTicketTiers ? tesotunesAvailable <= 0 : totalCapacity > 0 && totalSold >= totalCapacity

  function handleBookmark() {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? 'Bookmark removed' : 'Event saved')
  }

  function handleProceedToCheckout() {
    const params = new URLSearchParams(searchParams.toString())
    const suffix = params.toString()
    router.push(`/events/${id}/checkout${suffix ? `?${suffix}` : ''}`)
  }

  async function handleJoinWaitlist() {
    if (!event) return

    try {
      const response = await joinWaitlist.mutateAsync({
        eventId: event.id,
        email: waitlistEmail || undefined,
        phone: waitlistPhone || undefined,
      })
      toast.success(response.message)
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 401) {
        const redirect = encodeURIComponent(`/events/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)
        router.push(`/login?redirect=${redirect}`)
        return
      }

      toast.error(error instanceof Error ? error.message : 'Failed to join waitlist')
    }
  }
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={
            getEventImage(event)
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
              {isHybrid && (
                <span className="px-3 py-1 bg-sky-500/90 text-white text-sm rounded-full">
                  Hybrid Ticketing
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(startsAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>
                  {formatTimeRange(
                    startsAt,
                    endsAt,
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
                  <span>{getEventVenueLabel(event)}</span>
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
              <LikeButton
                likeableType="event"
                likeableId={event.id}
                variant="pill"
                showCount
              />
              <FollowButton
                followableType="event"
                followableId={event.id}
                variant="compact"
                followLabel="Follow Event"
                followingLabel="Following"
              />
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

            {isHybrid && ticketingSummary && (
              <section>
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-900/50 dark:bg-sky-950/30">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-sky-500/10 p-2 text-sky-700 dark:text-sky-300">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-base font-semibold">Tesotunes tickets are live for this hybrid event</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          You can still buy through Tesotunes here, while the organizer may also reserve inventory for outlets, printed booklets, or other partner channels.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border bg-background/80 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tesotunes available</p>
                          <p className="mt-1 text-lg font-semibold">
                            {ticketingSummary.tesotunes_available == null ? 'Open' : ticketingSummary.tesotunes_available.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-lg border bg-background/80 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">External reserved</p>
                          <p className="mt-1 text-lg font-semibold">{ticketingSummary.external_allocated.toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg border bg-background/80 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Online sell-through</p>
                          <p className="mt-1 text-lg font-semibold">{ticketingSummary.online_sell_through_percent.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

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
                        {getEventVenueLabel(event) || 'Venue TBA'}
                      </p>
                      {event.venue_address && (
                        <p className="text-muted-foreground text-sm">
                          {event.venue_address}
                        </p>
                      )}
                      <p className="text-muted-foreground text-sm">
                        {getEventLocationSummary(event)}
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
                  value={formatDate(startsAt)}
                />
                <DetailCard
                  icon={<Clock className="h-5 w-5 text-primary" />}
                  label="Time"
                  value={formatTimeRange(
                    startsAt,
                    endsAt,
                  )}
                />
                {getEventCapacity(event) > 0 && (
                  <DetailCard
                    icon={<Users className="h-5 w-5 text-primary" />}
                    label="Capacity"
                    value={`${getEventCapacity(event).toLocaleString()} attendees`}
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

              {isExternalOnly ? (
                <div className="p-6 rounded-xl border bg-card">
                  <h2 className="text-lg font-semibold mb-3">Ticketing</h2>
                  <p className="text-sm text-muted-foreground">
                    This event is being promoted on Tesotunes, but checkout happens through the organizer&apos;s own ticketing channel.
                  </p>
                </div>
              ) : event.ticket_tiers && event.ticket_tiers.length > 0 ? (
                <div className="space-y-4">
                  {isHybrid && ticketingSummary && (
                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm dark:border-sky-900/50 dark:bg-sky-950/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-sky-900 dark:text-sky-100">Buy on Tesotunes or catch limited partner inventory elsewhere</p>
                          <p className="mt-1 text-sky-900/80 dark:text-sky-100/80">
                            Tesotunes checkout is active. {ticketingSummary.external_allocated > 0
                              ? ` ${ticketingSummary.external_allocated.toLocaleString()} tickets are currently reserved for outside channels.`
                              : ' The organizer can still reconcile outside ticket sales without affecting your Tesotunes purchase here.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <TicketSelector
                    tiers={event.ticket_tiers}
                    eventId={event.id}
                    isPastEvent={isPastEvent}
                    isCancelled={event.status === 'cancelled'}
                    waitlistCount={event.waitlist_count || 0}
                    waitlistJoined={event.waitlist_joined || false}
                    isJoiningWaitlist={joinWaitlist.isPending}
                    onJoinWaitlist={isSoldOut ? handleJoinWaitlist : undefined}
                    onProceedToCheckout={handleProceedToCheckout}
                  />
                </div>
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

              {!isExternalOnly && !isPastEvent && !isSoldOut && event.status !== 'cancelled' && (
                <GroupBookingCTA eventId={event.id} />
              )}

              {!isExternalOnly && isSoldOut && event.status !== 'cancelled' && (
                <div className="rounded-xl border bg-card p-4">
                  <h3 className="font-semibold">Sold-Out Waitlist</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Join the waitlist and Tesotunes will keep this event on your radar if tickets open up again.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sign in with your Tesotunes account so your waitlist alert follows you across devices.
                  </p>
                  <div className="mt-4 space-y-3">
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="Notification email"
                      className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                    />
                    <input
                      type="tel"
                      value={waitlistPhone}
                      onChange={(e) => setWaitlistPhone(e.target.value)}
                      placeholder="Phone number (optional)"
                      className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                    />
                    <button
                      onClick={handleJoinWaitlist}
                      disabled={joinWaitlist.isPending || !!event.waitlist_joined}
                      className={cn(
                        'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        event.waitlist_joined
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90',
                        joinWaitlist.isPending && 'opacity-70'
                      )}
                    >
                      {event.waitlist_joined ? 'You are on the waitlist' : joinWaitlist.isPending ? 'Joining Waitlist...' : 'Join Waitlist'}
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {event.waitlist_count || 0} fan{(event.waitlist_count || 0) === 1 ? '' : 's'} currently waiting.
                  </p>
                </div>
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
              {!event.organizer && getEventOrganizerName(event) && (
                <div className="p-4 rounded-xl border">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                    Organized by
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                      <div className="h-full w-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                        {getEventOrganizerName(event)?.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{getEventOrganizerName(event)}</p>
                      <p className="text-xs text-muted-foreground">Event Organizer</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="container py-8">
        <CommentSection
          commentableType="event"
          commentableId={event.id}
          title={`Comments on ${event.title}`}
        />
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
