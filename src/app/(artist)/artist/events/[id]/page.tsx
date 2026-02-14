'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Edit,
  Share2,
  Loader2,
  Ticket,
  BarChart3,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { Event } from '@/hooks/useEvents';
import { toast } from 'sonner';

export default function ArtistEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['artist', 'events', id],
    queryFn: () => apiGet<{ data: Event }>(`/artist/events/${id}`).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">Event not found</h2>
        <Link href="/artist/events" className="text-primary hover:underline">Back to Events</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    postponed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  const ticketsSold = event.tickets_sold || event.ticket_tiers?.reduce((sum, t) => sum + (t.quantity_sold || 0), 0) || 0;
  const totalTickets = event.attendee_limit || event.capacity || event.ticket_tiers?.reduce((sum, t) => sum + (t.quantity_total || t.quantity || 0), 0) || 0;
  const sellThrough = totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;
  const coverImage = event.artwork || event.banner || event.image;
  const eventDate = event.starts_at || event.date;
  const eventTime = event.time || (event.starts_at ? new Date(event.starts_at).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBA');

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/artist/events" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[event.status] || statusColors.draft}`}>
              {event.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleShare} className="p-2 rounded-lg border hover:bg-muted" title="Share">
            <Share2 className="h-4 w-4" />
          </button>
          <Link
            href={`/artist/events/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5">
        {coverImage ? (
          <Image src={coverImage} alt={event.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-primary/30" />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Tickets Sold</span>
          </div>
          <p className="text-2xl font-bold">{ticketsSold} / {totalTickets || '∞'}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-muted-foreground">Sell-Through</span>
          </div>
          <p className="text-2xl font-bold">{sellThrough}%</p>
        </div>
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Attendees</span>
          </div>
          <p className="text-2xl font-bold">{event.attendee_count || ticketsSold}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Ticket Tiers</span>
          </div>
          <p className="text-2xl font-bold">{event.ticket_tiers?.length || 0}</p>
        </div>
      </div>

      {/* Event Details + Ticket Tiers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Event Details</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">
                  {eventDate
                    ? new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Date TBA'}
                </p>
                <p className="text-sm text-muted-foreground">{eventTime}</p>
              </div>
            </div>
            {event.is_virtual ? (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">Online Event</p>
                  {event.virtual_link && (
                    <a href={event.virtual_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      Join Link
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">{event.venue_name || event.venue || 'Venue TBA'}</p>
                  <p className="text-sm text-muted-foreground">
                    {[event.city, event.country].filter(Boolean).join(', ') || event.location}
                  </p>
                </div>
              </div>
            )}
            {event.category && (
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-muted text-xs rounded-full">{event.category}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
        </div>
      </div>

      {/* Ticket Tiers */}
      {event.ticket_tiers && event.ticket_tiers.length > 0 && (
        <div className="rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Ticket Tiers</h2>
          <div className="space-y-3">
            {event.ticket_tiers.map((tier) => {
              const tierTotal = tier.quantity_total || tier.quantity || 0;
              const tierSold = tier.quantity_sold || 0;
              const tierAvailable = tier.available ?? (tierTotal - tierSold);
              const tierProgress = tierTotal > 0 ? (tierSold / tierTotal) * 100 : 0;

              return (
                <div key={tier.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{tier.name}</p>
                      {tier.description && (
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {tier.is_free ? (
                        <p className="font-bold text-green-500">Free</p>
                      ) : (
                        <>
                          <p className="font-bold">UGX {(tier.price_ugx || tier.price || 0).toLocaleString()}</p>
                          {(tier.price_credits ?? 0) > 0 && (
                            <p className="text-xs text-muted-foreground">{tier.price_credits?.toLocaleString()} credits</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(tierProgress, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {tierSold}/{tierTotal} sold
                    </span>
                    {tierAvailable <= 0 && (
                      <span className="text-xs text-red-500 font-medium">Sold out</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
