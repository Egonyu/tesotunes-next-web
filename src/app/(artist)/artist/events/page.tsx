'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus,
  Calendar,
  MapPin,
  Clock,
  Users,
  Ticket,
  Edit,
  Eye,
  ExternalLink,
  Loader2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistEvents, useDeleteEvent } from '@/hooks/useEvents';
import { toast } from 'sonner';

export default function ArtistEventsPage() {
  const [page, setPage] = useState(1);
  const { data: eventsData, isLoading, error } = useArtistEvents({ page, per_page: 20 });
  const deleteEvent = useDeleteEvent();

  const events = eventsData?.data || [];
  const upcomingEvents = events.filter(e => e.status === 'published' || e.status === 'draft');
  const pastEvents = events.filter(e => e.status === 'completed' || e.status === 'cancelled');
  
  const statusStyles: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    published: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  const handleDelete = (eventId: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    deleteEvent.mutate(eventId, {
      onSuccess: () => toast.success('Event deleted successfully'),
      onError: () => toast.error('Failed to delete event'),
    });
  };

  const totalTicketsSold = events.reduce((acc, e) => acc + (e.tickets_sold || 0), 0);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load events</p>
        <p className="text-sm text-muted-foreground">{(error as any)?.message || 'Please try again later'}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Manage your concerts and appearances</p>
        </div>
        <Link
          href="/artist/events/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{upcomingEvents.length}</p>
          <p className="text-sm text-muted-foreground">Upcoming Events</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{totalTicketsSold.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Tickets Sold</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{events.length}</p>
          <p className="text-sm text-muted-foreground">Total Events</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{pastEvents.length}</p>
          <p className="text-sm text-muted-foreground">Past Events</p>
        </div>
      </div>
      
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className="flex flex-col md:flex-row rounded-xl border bg-card overflow-hidden"
              >
                <div className="relative w-full md:w-64 h-48 md:h-auto bg-muted flex-shrink-0">
                  <Image
                    src={event.image || '/images/placeholder.jpg'}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.time}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.venue || 'TBD'}{event.city ? `, ${event.city}` : event.location ? `, ${event.location}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium capitalize',
                      statusStyles[event.status] || statusStyles.draft
                    )}>
                      {event.status}
                    </span>
                  </div>
                  
                  {event.capacity && event.capacity > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-1">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          <span>{event.tickets_sold || 0} / {event.capacity} tickets sold</span>
                        </div>
                        <span className="font-medium">
                          {Math.round(((event.tickets_sold || 0) / event.capacity) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(((event.tickets_sold || 0) / event.capacity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/artist/events/${event.id}`}
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                    <Link
                      href={`/artist/events/${event.id}/edit`}
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                    <Link
                      href={`/events/${event.id}`}
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Public Page
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                      disabled={deleteEvent.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event) => (
              <div key={event.id} className="rounded-xl border bg-card overflow-hidden">
                <div className="relative h-40 bg-muted">
                  <Image
                    src={event.image || '/images/placeholder.jpg'}
                    alt={event.title}
                    fill
                    className="object-cover opacity-75"
                  />
                  <span className={cn(
                    'absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium capitalize',
                    statusStyles[event.status] || statusStyles.completed
                  )}>
                    {event.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(event.date).toLocaleDateString()} {event.venue ? `• ${event.venue}` : ''}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{event.tickets_sold || 0} attendees</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No events yet</p>
          <p className="text-muted-foreground mb-4">Create your first event to start selling tickets</p>
          <Link
            href="/artist/events/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </div>
      )}
    </div>
  );
}
