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
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: number;
  title: string;
  venue: string;
  location: string;
  image: string;
  date: string;
  time: string;
  ticketsSold: number;
  capacity: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function ArtistEventsPage() {
  const events: Event[] = [
    { id: 1, title: 'Live at Serena Hotel', venue: 'Serena Hotel', location: 'Kampala', image: '/images/events/serena.jpg', date: '2026-03-15', time: '20:00', ticketsSold: 450, capacity: 500, status: 'upcoming' },
    { id: 2, title: 'TesoTunes Festival 2026', venue: 'Lugogo Cricket Oval', location: 'Kampala', image: '/images/events/festival.jpg', date: '2026-04-20', time: '14:00', ticketsSold: 2500, capacity: 5000, status: 'upcoming' },
    { id: 3, title: 'New Year Concert', venue: 'Speke Resort', location: 'Munyonyo', image: '/images/events/nye.jpg', date: '2025-12-31', time: '22:00', ticketsSold: 1000, capacity: 1000, status: 'completed' },
  ];
  
  const statusStyles = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };
  
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status !== 'upcoming');
  
  return (
    <div className="space-y-6">
      {/* Header */}
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
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{upcomingEvents.length}</p>
          <p className="text-sm text-muted-foreground">Upcoming Events</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{upcomingEvents.reduce((acc, e) => acc + e.ticketsSold, 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Tickets Sold</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">UGX 45M</p>
          <p className="text-sm text-muted-foreground">Expected Revenue</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{pastEvents.length}</p>
          <p className="text-sm text-muted-foreground">Past Events</p>
        </div>
      </div>
      
      {/* Upcoming Events */}
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
                    src={event.image}
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
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.venue}, {event.location}
                        </div>
                      </div>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium capitalize',
                      statusStyles[event.status]
                    )}>
                      {event.status}
                    </span>
                  </div>
                  
                  {/* Ticket Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-1">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span>{event.ticketsSold} / {event.capacity} tickets sold</span>
                      </div>
                      <span className="font-medium">
                        {Math.round((event.ticketsSold / event.capacity) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/artist/events/${event.id}`}
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event) => (
              <div key={event.id} className="rounded-xl border bg-card overflow-hidden">
                <div className="relative h-40 bg-muted">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover opacity-75"
                  />
                  <span className={cn(
                    'absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium capitalize',
                    statusStyles[event.status]
                  )}>
                    {event.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(event.date).toLocaleDateString()} • {event.venue}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{event.ticketsSold} attendees</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
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
