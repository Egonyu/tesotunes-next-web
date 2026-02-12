'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
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
} from 'lucide-react';

interface EventDetail {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  cover_image: string;
  ticket_price: number;
  tickets_sold: number;
  total_tickets: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  revenue: number;
}

export default function ArtistEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: event, isLoading } = useQuery({
    queryKey: ['artist', 'events', id],
    queryFn: () => apiGet<{ data: EventDetail }>(`/api/artist/events/${id}`).then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[event.status]}`}>
              {event.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg border hover:bg-muted">
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
      <div className="relative h-64 rounded-xl overflow-hidden bg-linear-to-r from-primary/20 to-primary/5">
        {event.cover_image ? (
          <Image src={event.cover_image} alt={event.title} fill className="object-cover" />
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
          <p className="text-2xl font-bold">{event.tickets_sold} / {event.total_tickets}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <p className="text-2xl font-bold">${event.revenue?.toLocaleString() || 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Ticket Price</span>
          </div>
          <p className="text-2xl font-bold">${event.ticket_price}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-muted-foreground">Sell-through</span>
          </div>
          <p className="text-2xl font-bold">
            {event.total_tickets > 0 ? Math.round((event.tickets_sold / event.total_tickets) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Event Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Event Details</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-sm text-muted-foreground">{event.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">{event.venue}</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
        </div>
      </div>
    </div>
  );
}
