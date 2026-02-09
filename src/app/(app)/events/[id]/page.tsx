'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Share2, 
  Heart,
  Ticket,
  Music2,
  ChevronRight,
  Check,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TicketTier {
  id: number;
  name: string;
  price: number;
  description: string;
  available: number;
  benefits: string[];
}

interface EventDetails {
  id: number;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  date: string;
  endDate?: string;
  time: string;
  venue: string;
  venueAddress: string;
  location: string;
  mapUrl: string;
  attendees: number;
  capacity: number;
  category: string;
  isFeatured: boolean;
  isSoldOut: boolean;
  isInterested: boolean;
  artists: { id: number; name: string; image: string; role: string }[];
  ticketTiers: TicketTier[];
  organizer: {
    name: string;
    logo: string;
    isVerified: boolean;
  };
  schedule: { time: string; title: string; description: string }[];
  tags: string[];
}

export default function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const [isInterested, setIsInterested] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}`);
      return res.data as EventDetails;
    },
  });
  
  // Mock data
  const mockEvent: EventDetails = {
    id: parseInt(id),
    slug: 'tesofest-2026',
    title: 'TesoFest 2026 - The Ultimate Music Experience',
    description: 'The biggest music festival in East Africa returns!',
    longDescription: `TesoFest 2026 is back and bigger than ever! Join us for an unforgettable 3-day music experience featuring the biggest names in East African music.

Experience world-class performances, delicious food from local vendors, art installations, and much more. This year's theme celebrates African unity through music.

**What to Expect:**
- 30+ live performances across 3 stages
- Food court with 50+ vendors
- Art installations and exhibitions
- VIP lounge experience
- Meet & greet opportunities
- After-parties at select venues`,
    image: '/images/event-1.jpg',
    gallery: ['/images/event-1-2.jpg', '/images/event-1-3.jpg', '/images/event-1-4.jpg'],
    date: '2026-03-15',
    endDate: '2026-03-17',
    time: '2:00 PM - 11:00 PM',
    venue: 'Lugogo Cricket Oval',
    venueAddress: 'Plot 3, Jinja Road, Lugogo, Kampala',
    location: 'Kampala, Uganda',
    mapUrl: 'https://maps.google.com',
    attendees: 3500,
    capacity: 10000,
    category: 'Festivals',
    isFeatured: true,
    isSoldOut: false,
    isInterested: false,
    artists: [
      { id: 1, name: 'Eddy Kenzo', image: '/images/artist-1.jpg', role: 'Headliner' },
      { id: 2, name: 'Sheebah', image: '/images/artist-2.jpg', role: 'Headliner' },
      { id: 3, name: 'Bebe Cool', image: '/images/artist-3.jpg', role: 'Performer' },
      { id: 4, name: 'Fik Fameica', image: '/images/artist-4.jpg', role: 'Performer' },
      { id: 5, name: 'Spice Diana', image: '/images/artist-5.jpg', role: 'Performer' },
    ],
    ticketTiers: [
      {
        id: 1,
        name: 'Early Bird',
        price: 50000,
        description: 'Limited early bird tickets',
        available: 0,
        benefits: ['General admission', 'Access to main stage', 'Festival wristband'],
      },
      {
        id: 2,
        name: 'Regular',
        price: 80000,
        description: 'Standard festival entry',
        available: 2450,
        benefits: ['General admission', 'Access to all stages', 'Festival wristband'],
      },
      {
        id: 3,
        name: 'VIP',
        price: 250000,
        description: 'Premium experience',
        available: 180,
        benefits: ['VIP entrance', 'Access to VIP lounge', 'Complimentary drinks', 'Priority viewing', 'Meet & greet access'],
      },
      {
        id: 4,
        name: 'VVIP Table',
        price: 500000,
        description: 'Ultimate luxury experience',
        available: 12,
        benefits: ['Private table for 4', 'Bottle service', 'Personal host', 'Artist backstage access', 'After-party access'],
      },
    ],
    organizer: {
      name: 'TesoTunes Events',
      logo: '/images/tesotunes-logo.png',
      isVerified: true,
    },
    schedule: [
      { time: '2:00 PM', title: 'Gates Open', description: 'Festival grounds open to attendees' },
      { time: '3:00 PM', title: 'Opening Act', description: 'Rising stars showcase' },
      { time: '5:00 PM', title: 'Main Stage Performances', description: 'Featured artists take the stage' },
      { time: '8:00 PM', title: 'Headliner Performance', description: 'Eddy Kenzo live' },
      { time: '10:00 PM', title: 'Closing Act', description: 'Sheebah live performance' },
    ],
    tags: ['Music', 'Festival', 'Outdoor', 'Live Performance', 'East Africa'],
  };
  
  const displayEvent = event || mockEvent;
  const eventDate = new Date(displayEvent.date);
  const isPastEvent = eventDate < new Date();
  
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
  
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={displayEvent.image || '/images/default-event.jpg'}
          alt={displayEvent.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container">
            {/* Category & Date */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                {displayEvent.category}
              </span>
              <span className="text-white/80">
                {eventDate.toLocaleDateString('en', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {displayEvent.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{displayEvent.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{displayEvent.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{displayEvent.attendees.toLocaleString()} going</span>
              </div>
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
              <button className="p-2 border rounded-lg hover:bg-muted">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            
            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{displayEvent.longDescription}</p>
              </div>
            </section>
            
            {/* Artists */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Performing Artists</h2>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                {displayEvent.artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artists/${artist.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={artist.image || '/images/default-avatar.jpg'}
                        alt={artist.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{artist.name}</p>
                      <p className="text-sm text-muted-foreground">{artist.role}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            
            {/* Schedule */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Event Schedule</h2>
              <div className="space-y-4">
                {displayEvent.schedule.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg border">
                    <div className="text-center min-w-[80px]">
                      <p className="font-bold text-primary">{item.time}</p>
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Venue */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Venue</h2>
              <div className="p-4 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-lg">{displayEvent.venue}</p>
                    <p className="text-muted-foreground">{displayEvent.venueAddress}</p>
                  </div>
                  <a 
                    href={displayEvent.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View Map <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="mt-4 h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  Map Preview
                </div>
              </div>
            </section>
          </div>
          
          {/* Sidebar - Tickets */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-xl border bg-card">
                <h2 className="text-xl font-semibold mb-4">Tickets</h2>
                
                {isPastEvent ? (
                  <p className="text-muted-foreground">This event has already ended.</p>
                ) : displayEvent.isSoldOut ? (
                  <div className="text-center py-4">
                    <p className="text-lg font-medium text-red-500">Sold Out</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Join the waitlist to be notified if tickets become available.
                    </p>
                    <button className="w-full mt-4 px-4 py-2 border rounded-lg hover:bg-muted">
                      Join Waitlist
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayEvent.ticketTiers.map((tier) => (
                      <div
                        key={tier.id}
                        onClick={() => tier.available > 0 && setSelectedTier(tier.id)}
                        className={cn(
                          'p-4 rounded-lg border cursor-pointer transition-all',
                          tier.available === 0 && 'opacity-50 cursor-not-allowed',
                          selectedTier === tier.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-foreground'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{tier.name}</p>
                            <p className="text-sm text-muted-foreground">{tier.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">UGX {tier.price.toLocaleString()}</p>
                            {tier.available === 0 ? (
                              <span className="text-xs text-red-500">Sold out</span>
                            ) : tier.available < 50 ? (
                              <span className="text-xs text-orange-500">{tier.available} left</span>
                            ) : null}
                          </div>
                        </div>
                        
                        {selectedTier === tier.id && (
                          <ul className="mt-3 pt-3 border-t space-y-1">
                            {tier.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-500" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    
                    <Link
                      href={selectedTier ? `/events/${id}/tickets?tier=${selectedTier}` : '#'}
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
                )}
              </div>
              
              {/* Organizer */}
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Organized by</p>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={displayEvent.organizer.logo}
                      alt={displayEvent.organizer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-medium">{displayEvent.organizer.name}</p>
                      {displayEvent.organizer.isVerified && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <button className="text-sm text-primary">View profile</button>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {displayEvent.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-muted text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
