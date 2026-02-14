'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Edit, Trash2, Calendar, MapPin, Clock, Users, Ticket,
  ExternalLink, Star, Music, DollarSign, Eye
} from 'lucide-react';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';

interface Artist {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description: string;
}

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  event_type: string;
  venue_name: string;
  venue_address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  timezone: string;
  is_online: boolean;
  online_url: string;
  is_free: boolean;
  currency: string;
  min_age: number | null;
  max_capacity: number | null;
  is_featured: boolean;
  status: string;
  cover_url: string;
  artists: Artist[];
  ticket_tiers: TicketTier[];
  stats: {
    tickets_sold: number;
    revenue: number;
    page_views: number;
    interested: number;
    going: number;
  };
  created_at: string;
  updated_at: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatEventDate(date: string, time: string): string {
  const d = new Date(`${date}T${time}`);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatEventTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

const eventTypeLabels: Record<string, string> = {
  concert: 'Concert',
  festival: 'Festival',
  club_night: 'Club Night',
  live_stream: 'Live Stream',
  album_release: 'Album Release',
  meet_greet: 'Meet & Greet',
  workshop: 'Workshop',
  other: 'Other',
};

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['admin', 'event', id],
    queryFn: () => apiGet<{ data: EventDetail }>(`/admin/events/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/admin/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      router.push('/admin/events');
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: () => apiPost(`/admin/events/${id}/toggle-featured`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', id] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => apiPost(`/admin/events/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse" />
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!event?.data) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Event not found</h2>
        <Link href="/admin/events" className="text-primary hover:underline mt-2 inline-block">
          Back to events
        </Link>
      </div>
    );
  }

  const e = event.data;
  const totalTickets = e.ticket_tiers?.reduce((sum, t) => sum + t.quantity, 0) || e.max_capacity || 0;
  const ticketsSold = e.ticket_tiers?.reduce((sum, t) => sum + t.sold, 0) || e.stats.tickets_sold;
  const soldPercentage = totalTickets > 0 ? (ticketsSold / totalTickets) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={e.title}
        description={eventTypeLabels[e.event_type] || e.event_type}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Events', href: '/admin/events' },
          { label: e.title },
        ]}
        backHref="/admin/events"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/events/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
        {e.cover_url ? (
          <Image
            src={e.cover_url}
            alt={e.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-purple-500 to-pink-600" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={e.status} />
            {e.is_featured && (
              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500 text-black rounded">
                Featured
              </span>
            )}
            {e.is_free && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded">
                Free
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{e.title}</h2>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatEventDate(e.start_date, e.start_time)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{formatEventTime(e.start_time)}</span>
            </div>
            {!e.is_online && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{e.venue_name}, {e.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Ticket className="h-4 w-4" />
                <span className="text-sm">Tickets Sold</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(ticketsSold)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Revenue</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(e.stats.revenue, e.currency)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Page Views</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(e.stats.page_views)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Interested</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(e.stats.interested)}</p>
            </div>
          </div>

          {/* Ticket Sales Progress */}
          {totalTickets > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Ticket Sales</h3>
                <span className="text-sm text-muted-foreground">
                  {ticketsSold} / {totalTickets} sold
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {soldPercentage.toFixed(1)}% sold
              </p>
            </div>
          )}

          {/* Ticket Tiers */}
          {e.ticket_tiers?.length > 0 && (
            <div className="rounded-xl border bg-card">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Ticket Tiers</h3>
              </div>
              <div className="divide-y">
                {e.ticket_tiers.map((tier) => (
                  <div key={tier.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{tier.name}</p>
                      {tier.description && (
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(tier.price, e.currency)}</p>
                      <p className="text-sm text-muted-foreground">
                        {tier.sold} / {tier.quantity} sold
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performing Artists */}
          {e.artists?.length > 0 && (
            <div className="rounded-xl border bg-card">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Performing Artists</h3>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {e.artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/admin/artists/${artist.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      {artist.image_url ? (
                        <Image
                          src={artist.image_url}
                          alt={artist.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <Music className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{artist.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {e.description && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">About This Event</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{e.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {e.status === 'draft' && (
                <button
                  onClick={() => publishMutation.mutate()}
                  className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2"
                  disabled={publishMutation.isPending}
                >
                  <Eye className="h-4 w-4" />
                  Publish Event
                </button>
              )}
              <button
                onClick={() => toggleFeatureMutation.mutate()}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2"
                disabled={toggleFeatureMutation.isPending}
              >
                <Star className="h-4 w-4" />
                {e.is_featured ? 'Unfeature' : 'Feature'} Event
              </button>
              <Link
                href={`/admin/events/${id}/attendees`}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                View Attendees
              </Link>
              <Link
                href={`/admin/events/${id}/analytics`}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Analytics
              </Link>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            {e.is_online ? (
              <div>
                <p className="text-muted-foreground mb-2">Online Event</p>
                {e.online_url && (
                  <a
                    href={e.online_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Join Link <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ) : (
              <div>
                <p className="font-medium">{e.venue_name}</p>
                <p className="text-sm text-muted-foreground">{e.venue_address}</p>
                <p className="text-sm text-muted-foreground">{e.city}, {e.country}</p>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{eventTypeLabels[e.event_type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Start</dt>
                <dd>{new Date(`${e.start_date}T${e.start_time}`).toLocaleString()}</dd>
              </div>
              {e.end_date && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">End</dt>
                  <dd>{new Date(`${e.end_date}T${e.end_time}`).toLocaleString()}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Timezone</dt>
                <dd>{e.timezone}</dd>
              </div>
              {e.min_age && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Min Age</dt>
                  <dd>{e.min_age}+</dd>
                </div>
              )}
              {e.max_capacity && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Capacity</dt>
                  <dd>{e.max_capacity.toLocaleString()}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(e.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Event"
        description={`Are you sure you want to delete "${e.title}"? This will permanently remove the event and all associated data.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
