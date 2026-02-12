'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Search,
  Filter,
  Ticket,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEvents, useFeaturedEvents, useEventCategories } from '@/hooks/useEvents';
import type { Event } from '@/hooks/useEvents';

function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();
  
  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        'group block rounded-xl overflow-hidden border bg-card hover:shadow-lg transition-shadow',
        featured && 'md:flex md:h-72'
      )}
    >
      <div className={cn(
        'relative',
        featured ? 'md:w-1/2 h-48 md:h-full' : 'h-48'
      )}>
        <Image
          src={event.image || event.banner_image || '/images/placeholder.jpg'}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white rounded-lg p-2 text-center min-w-[60px]">
          <p className="text-xs text-gray-500 uppercase">
            {eventDate.toLocaleDateString('en', { month: 'short' })}
          </p>
          <p className="text-xl font-bold text-gray-900">
            {eventDate.getDate()}
          </p>
        </div>
        
        {/* Status Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {event.is_featured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
              Featured
            </span>
          )}
          {isPastEvent && (
            <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
              Past Event
            </span>
          )}
        </div>
        
        {/* Category */}
        {event.category && (
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-sm rounded-full capitalize">
              {event.category}
            </span>
          </div>
        )}
      </div>
      
      <div className={cn(
        'p-4',
        featured && 'md:w-1/2 md:p-6 flex flex-col justify-center'
      )}>
        <h3 className={cn(
          'font-semibold group-hover:text-primary transition-colors',
          featured ? 'text-xl md:text-2xl' : 'text-lg'
        )}>
          {event.title}
        </h3>
        
        {featured && event.description && (
          <p className="text-muted-foreground mt-2 line-clamp-2">
            {event.description}
          </p>
        )}
        
        <div className="flex flex-col gap-2 mt-3 text-sm text-muted-foreground">
          {event.time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.venue || 'TBD'}{event.city ? `, ${event.city}` : event.location ? `, ${event.location}` : ''}</span>
          </div>
          {event.tickets_sold !== undefined && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event.tickets_sold} going</span>
            </div>
          )}
        </div>
        
        {/* Artist */}
        {event.artist && (
          <div className="flex items-center gap-2 mt-3">
            <div className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden">
              <Image
                src={event.artist.image || '/images/placeholder.jpg'}
                alt={event.artist.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm text-muted-foreground">{event.artist.name}</span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div>
            {event.ticket_tiers && event.ticket_tiers.length > 0 ? (
              <>
                {event.ticket_tiers.every(t => t.price === 0) ? (
                  <span className="font-bold text-green-500">Free</span>
                ) : (
                  <>
                    <span className="font-bold">
                      UGX {Math.min(...event.ticket_tiers.map(t => t.price)).toLocaleString()}
                    </span>
                    {event.ticket_tiers.length > 1 && (
                      <span className="text-muted-foreground">
                        {' '}- {Math.max(...event.ticket_tiers.map(t => t.price)).toLocaleString()}
                      </span>
                    )}
                  </>
                )}
              </>
            ) : (
              <span className="font-bold text-green-500">Free</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-sm text-primary">
            <Ticket className="h-4 w-4" />
            Get Tickets
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  
  const { data: categoriesData } = useEventCategories();
  const categories = ['All', ...(categoriesData || [])];
  
  const { data: eventsData, isLoading } = useEvents({
    page,
    per_page: 12,
    category: activeCategory !== 'All' ? activeCategory : undefined,
    search: searchQuery || undefined,
  });
  
  const { data: featuredEvents } = useFeaturedEvents();
  
  const events = eventsData?.data || [];
  
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Discover live music events, concerts, and festivals
          </p>
        </div>
      </div>
      
      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background"
          />
        </div>
      </div>
      
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setPage(1); }}
            className={cn(
              'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors capitalize',
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-muted'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* Featured Events */}
      {featuredEvents && featuredEvents.length > 0 && activeCategory === 'All' && !searchQuery && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Featured Events</h2>
          <div className="space-y-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} featured />
            ))}
          </div>
        </section>
      )}
      
      {/* All Events */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          {activeCategory === 'All' ? 'Upcoming Events' : `${activeCategory} Events`}
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 border rounded-xl">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try different search terms' : 'Check back later for upcoming events'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
