'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Share2, 
  Heart,
  Ticket,
  ChevronLeft,
  Check,
  ExternalLink,
  Globe,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEvent, Event, EventTicketTier } from '@/hooks/useEvents';
import { toast } from 'sonner';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
  });
}

function formatTime(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatTimeRange(start?: string, end?: string) {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s} - ${e}`;
  return s || 'TBA';
}

export default function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const [isInterested, setIsInterested] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  
  const { data: event, isLoading, error } = useEvent(id);
  
  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="h-96 bg-muted rounded-xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="container py-16 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This event may have been removed or doesn&apos;t exist.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <ChevronLeft className="h-4 w-4" />
          Browse Events
        </Link>
      </div>
    );
  }
  
  const eventDate = event.starts_at ? new Date(event.starts_at) : null;
  const isPastEvent = eventDate ? eventDate < new Date() : false;
  const isSoldOut = event.ticket_tiers?.every(t => t.available <= 0) ?? false;
  const totalSold = event.tickets_sold ?? event.ticket_tiers?.reduce((sum, t) => sum + (t.quantity_sold || 0), 0) ?? 0;
  
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
        toast.success('Shared successfully');
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };
  
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={event.artwork || event.banner || event.image || '/images/illustrations/default-event.jpg'}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back button */}
        <Link 
          href="/events"
          className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-colors z-10"
        >
          <ChevronLeft className="h-4 w-4" />
          Events
        </Link>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container">
            {/* Category & Status */}
            <div className="flex items-center gap-3 mb-4">
              {event.category && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
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
                <span className="px-3 py-1 bg-yellow-500 text-black text-sm rounded-full">
                  Featured
                </span>
              )}
              <span className="text-white/80">
                {formatDate(event.starts_at || event.date)}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{formatTimeRange(event.starts_at || event.date, event.ends_at || event.end_date)}</span>
              </div>
              {event.is_virtual ? (
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>Online Event</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.venue_name || event.venue || event.city || 'TBA'}</span>
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setIsInterested(!isInterested)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                  isInterested 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'hover:bg-muted'
                )}
              >
                <Heart className={cn('h-5 w-5', isInterested && 'fill-primary')} />
                {isInterested ? 'Interested' : 'Mark Interested'}
              </button>
              <button 
                onClick={handleShare}
                className="p-2 border rounded-lg hover:bg-muted"
                title="Share event"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            
            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </section>
            
            {/* Artist info if available */}
            {event.artist && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Artist</h2>
                <Link
                  href={`/artists/${event.artist.slug || event.artist.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors w-fit"
                >
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                    {event.artist.image ? (
                      <Image
                        src={event.artist.image}
                        alt={event.artist.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                        {event.artist.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{event.artist.name}</p>
                    <p className="text-sm text-muted-foreground">View profile</p>
                  </div>
                </Link>
              </section>
            )}
            
            {/* Venue */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                {event.is_virtual ? 'Online Event' : 'Venue'}
              </h2>
              <div className="p-4 rounded-lg border">
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
                  <div>
                    <p className="font-medium text-lg">
                      {event.venue_name || event.venue || 'Venue TBA'}
                    </p>
                    {event.venue_address && (
                      <p className="text-muted-foreground">{event.venue_address}</p>
                    )}
                    <p className="text-muted-foreground">
                      {[event.city, event.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </section>
            
            {/* Event Details */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(event.starts_at || event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {formatTimeRange(event.starts_at || event.date, event.ends_at || event.end_date)}
                    </p>
                  </div>
                </div>
                {(event.attendee_limit || event.capacity) && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-medium">{(event.attendee_limit || event.capacity)?.toLocaleString()} attendees</p>
                    </div>
                  </div>
                )}
                {event.timezone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Timezone</p>
                      <p className="font-medium">{event.timezone}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <section>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(event.tags) ? event.tags : []).map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-muted text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
          
          {/* Sidebar - Tickets */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-xl border bg-card">
                <h2 className="text-xl font-semibold mb-4">Tickets</h2>
                
                {event.status === 'cancelled' ? (
                  <div className="text-center py-4">
                    <p className="text-lg font-medium text-red-500">Event Cancelled</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This event has been cancelled.
                    </p>
                  </div>
                ) : isPastEvent ? (
                  <p className="text-muted-foreground">This event has already ended.</p>
                ) : event.is_free ? (
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-green-500 mb-2">Free Event</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      No tickets required — just show up!
                    </p>
                    {event.registration_deadline && (
                      <p className="text-xs text-muted-foreground">
                        Registration closes {formatDate(event.registration_deadline)}
                      </p>
                    )}
                  </div>
                ) : isSoldOut ? (
                  <div className="text-center py-4">
                    <p className="text-lg font-medium text-red-500">Sold Out</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All tickets have been sold.
                    </p>
                  </div>
                ) : event.ticket_tiers && event.ticket_tiers.length > 0 ? (
                  <div className="space-y-4">
                    {event.ticket_tiers.map((tier) => (
                      <div
                        key={tier.id}
                        onClick={() => tier.available > 0 && setSelectedTier(tier.id)}
                        className={cn(
                          'p-4 rounded-lg border cursor-pointer transition-all',
                          tier.available <= 0 && 'opacity-50 cursor-not-allowed',
                          selectedTier === tier.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-foreground'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{tier.name}</p>
                              {tier.required_loyalty_tier && (
                                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 text-xs rounded-full">
                                  {tier.required_loyalty_tier}+ only
                                </span>
                              )}
                            </div>
                            {tier.description && (
                              <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                            )}
                            {tier.tier_early_access_hours && tier.tier_early_access_hours > 0 && (
                              <p className="text-xs text-primary mt-1">
                                {tier.tier_early_access_hours}h early access
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-3">
                            {tier.is_free ? (
                              <p className="font-bold text-green-500">Free</p>
                            ) : (
                              <>
                                <p className="font-bold">UGX {(tier.price_ugx || tier.price || 0).toLocaleString()}</p>
                                {tier.price_credits > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    or {tier.price_credits.toLocaleString()} credits
                                  </p>
                                )}
                              </>
                            )}
                            {tier.available <= 0 ? (
                              <span className="text-xs text-red-500">Sold out</span>
                            ) : tier.available < 50 ? (
                              <span className="text-xs text-orange-500">{tier.available} left</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Link
                      href={selectedTier ? `/events/${id}/tickets?tier=${selectedTier}` : '#'}
                      onClick={(e) => {
                        if (!selectedTier) {
                          e.preventDefault();
                          toast.info('Please select a ticket type first');
                        }
                      }}
                      className={cn(
                        'flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-medium transition-colors',
                        selectedTier
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      )}
                    >
                      <Ticket className="h-5 w-5" />
                      {selectedTier ? 'Get Tickets' : 'Select a Ticket'}
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Tickets not yet available.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check back soon for ticket information.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Organizer */}
              {event.organizer && (
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Organized by</p>
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
                      <p className="font-medium">{event.organizer.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
