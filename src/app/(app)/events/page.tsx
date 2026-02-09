'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Search,
  Filter,
  Ticket
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Event {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  price: number;
  maxPrice?: number;
  attendees: number;
  capacity: number;
  category: string;
  isFeatured: boolean;
  isSoldOut: boolean;
  artists: { name: string; image: string }[];
}

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
          src={event.image || '/images/default-event.jpg'}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white rounded-lg p-2 text-center min-w-[60px]">
          <p className="text-xs text-muted-foreground uppercase">
            {eventDate.toLocaleDateString('en', { month: 'short' })}
          </p>
          <p className="text-xl font-bold">
            {eventDate.getDate()}
          </p>
        </div>
        
        {/* Status Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {event.isFeatured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
              Featured
            </span>
          )}
          {event.isSoldOut && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              Sold Out
            </span>
          )}
          {isPastEvent && (
            <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
              Past Event
            </span>
          )}
        </div>
        
        {/* Category */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-sm rounded-full">
            {event.category}
          </span>
        </div>
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
        
        {featured && (
          <p className="text-muted-foreground mt-2 line-clamp-2">
            {event.description}
          </p>
        )}
        
        <div className="flex flex-col gap-2 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.venue}, {event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{event.attendees} going</span>
          </div>
        </div>
        
        {/* Artists */}
        {event.artists.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex -space-x-2">
              {event.artists.slice(0, 3).map((artist, i) => (
                <div 
                  key={i}
                  className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden"
                >
                  <Image
                    src={artist.image || '/images/default-avatar.jpg'}
                    alt={artist.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {event.artists.slice(0, 2).map(a => a.name).join(', ')}
              {event.artists.length > 2 && ` +${event.artists.length - 2} more`}
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div>
            {event.price === 0 ? (
              <span className="font-bold text-green-500">Free</span>
            ) : (
              <>
                <span className="font-bold">UGX {event.price.toLocaleString()}</span>
                {event.maxPrice && event.maxPrice > event.price && (
                  <span className="text-muted-foreground"> - {event.maxPrice.toLocaleString()}</span>
                )}
              </>
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
  
  const categories = [
    'All', 'Concerts', 'Festivals', 'Club Nights', 'Live Shows', 'Workshops', 'Meet & Greet'
  ];
  
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events');
      return res.data as Event[];
    },
  });
  
  // Mock data
  const mockEvents: Event[] = [
    {
      id: 1,
      slug: 'tesofest-2026',
      title: 'TesoFest 2026 - The Ultimate Music Experience',
      description: 'The biggest music festival in East Africa returns! Join us for 3 days of incredible performances from top artists.',
      image: '/images/event-1.jpg',
      date: '2026-03-15',
      time: '2:00 PM - 11:00 PM',
      venue: 'Lugogo Cricket Oval',
      location: 'Kampala, Uganda',
      price: 50000,
      maxPrice: 500000,
      attendees: 3500,
      capacity: 10000,
      category: 'Festivals',
      isFeatured: true,
      isSoldOut: false,
      artists: [
        { name: 'Eddy Kenzo', image: '/images/artist-1.jpg' },
        { name: 'Sheebah', image: '/images/artist-2.jpg' },
        { name: 'Bebe Cool', image: '/images/artist-3.jpg' },
      ],
    },
    {
      id: 2,
      slug: 'acoustic-nights',
      title: 'Acoustic Nights at Silk Lounge',
      description: 'An intimate evening of acoustic performances featuring rising stars.',
      image: '/images/event-2.jpg',
      date: '2026-02-20',
      time: '7:00 PM - 10:00 PM',
      venue: 'Silk Lounge',
      location: 'Kololo, Kampala',
      price: 25000,
      attendees: 87,
      capacity: 150,
      category: 'Live Shows',
      isFeatured: false,
      isSoldOut: false,
      artists: [
        { name: 'Kenneth Mugabi', image: '/images/artist-4.jpg' },
      ],
    },
    {
      id: 3,
      slug: 'dj-masterclass',
      title: 'DJ Masterclass with DJ Slick Stuart',
      description: 'Learn the art of DJing from one of Uganda\'s top DJs.',
      image: '/images/event-3.jpg',
      date: '2026-02-25',
      time: '10:00 AM - 4:00 PM',
      venue: 'Music Hub',
      location: 'Industrial Area, Kampala',
      price: 100000,
      attendees: 20,
      capacity: 30,
      category: 'Workshops',
      isFeatured: false,
      isSoldOut: false,
      artists: [],
    },
    {
      id: 4,
      slug: 'club-night-friday',
      title: 'Friday Night Vibes at Club Rouge',
      description: 'The hottest Friday night party in town!',
      image: '/images/event-4.jpg',
      date: '2026-02-14',
      time: '10:00 PM - 4:00 AM',
      venue: 'Club Rouge',
      location: 'Kisementi, Kampala',
      price: 20000,
      attendees: 450,
      capacity: 500,
      category: 'Club Nights',
      isFeatured: false,
      isSoldOut: true,
      artists: [
        { name: 'DJ Roja', image: '/images/dj-1.jpg' },
      ],
    },
  ];
  
  const displayEvents = events || mockEvents;
  const featuredEvents = displayEvents.filter(e => e.isFeatured);
  const regularEvents = displayEvents.filter(e => !e.isFeatured);
  
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
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 border rounded-lg hover:bg-muted">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>
      
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors',
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
      {featuredEvents.length > 0 && (
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
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
