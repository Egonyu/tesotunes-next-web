"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ChevronLeft,
  Users,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { FollowButton } from "@/components/social/FollowButton";

interface Event {
  id: number;
  title: string;
  slug: string;
  type: "concert" | "festival" | "livestream" | "meet_and_greet" | "listening_party";
  description: string;
  cover_url: string | null;
  date: string;
  end_date?: string;
  venue: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  is_virtual: boolean;
  tickets_url?: string;
  ticket_price_min?: number;
  ticket_price_max?: number;
  attendees_count: number;
  interested_count: number;
  is_attending: boolean;
  is_interested: boolean;
  status: "upcoming" | "live" | "past" | "cancelled";
}

interface ArtistEvents {
  artist: {
    id: number;
    name: string;
    slug: string;
    avatar_url: string | null;
  };
  upcoming: Event[];
  past: Event[];
}

const eventTypeLabels: Record<string, string> = {
  concert: "Concert",
  festival: "Festival",
  livestream: "Livestream",
  meet_and_greet: "Meet & Greet",
  listening_party: "Listening Party",
};

function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date);
  const isPast = event.status === "past";
  const isCancelled = event.status === "cancelled";

  return (
    <article
      className={`flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary sm:p-4 md:flex-row ${
        isPast || isCancelled ? "opacity-60" : ""
      }`}
    >
      <Link href={`/events/${event.id}`} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4 md:flex-row">
      {/* Date Block */}
      <div className="flex-shrink-0 w-20 h-20 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-primary">
          {eventDate.getDate()}
        </span>
        <span className="text-sm text-primary uppercase">
          {eventDate.toLocaleString("default", { month: "short" })}
        </span>
        <span className="text-xs text-muted-foreground">
          {eventDate.getFullYear()}
        </span>
      </div>

      {/* Cover Image */}
      {event.cover_url && (
        <div className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="px-2 py-0.5 bg-muted text-xs rounded capitalize">
            {eventTypeLabels[event.type] || event.type}
          </span>
          {event.is_virtual && (
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded">
              Virtual
            </span>
          )}
          {isCancelled && (
            <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs rounded">
              Cancelled
            </span>
          )}
          {event.status === "live" && (
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded animate-pulse">
              LIVE NOW
            </span>
          )}
        </div>

        <h3 className="mb-2 break-words text-lg font-bold [overflow-wrap:anywhere]">{event.title}</h3>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!event.is_virtual && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.venue.city}, {event.venue.country}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {formatNumber(event.attendees_count)} attending
          </span>
        </div>

        {event.ticket_price_min && !isPast && (
          <p className="mt-2 text-sm">
            <span className="font-medium">From {event.ticket_price_min.toLocaleString()} UGX</span>
          </p>
        )}
      </div>
      </Link>

      {/* Actions */}
      {!isPast && !isCancelled && event.tickets_url && (
        <div className="flex shrink-0 flex-col justify-center gap-2">
            <a
              href={event.tickets_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              <Ticket className="h-4 w-4" />
              Get Tickets
            </a>
        </div>
      )}
    </article>
  );
}

export default function ArtistEventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["artist-events", slug],
    queryFn: () => apiGet<ArtistEvents>(`/artists/${slug}/events`),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!eventsData) {
    return (
      <div className="container mx-auto py-16 text-center">
        <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Artist Not Found</h1>
        <Link href="/browse" className="text-primary hover:underline">
          Browse Music
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 py-5 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/artists/${slug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {eventsData.artist.name}
        </Link>
        <h1 className="flex min-w-0 items-center gap-3 break-words text-2xl font-bold [overflow-wrap:anywhere] sm:text-3xl">
          <Calendar className="h-8 w-8" />
          Events & Shows
        </h1>
        <p className="text-muted-foreground mt-1">
          See {eventsData.artist.name} live
        </p>
      </div>

      {/* Upcoming Events */}
      {eventsData.upcoming.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          <div className="space-y-4">
            {eventsData.upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Past Events */}
      {eventsData.past.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Past Events</h2>
          <div className="space-y-4">
            {eventsData.past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {eventsData.upcoming.length === 0 && eventsData.past.length === 0 && (
        <div className="text-center py-16 bg-card rounded-lg border">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No events scheduled</h2>
          <p className="text-muted-foreground mb-6">
            Follow {eventsData.artist.name} to get notified about upcoming events
          </p>
          <div className="mt-5 flex justify-center">
            <FollowButton followableType="artist" followableId={eventsData.artist.id} showCount={false} />
          </div>
        </div>
      )}

      {/* Newsletter CTA */}
      {eventsData.upcoming.length === 0 && eventsData.past.length > 0 && (
        <div className="mt-8 bg-linear-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Don't miss the next show!</h3>
          <p className="text-muted-foreground mb-4">
            Get notified when {eventsData.artist.name} announces new events
          </p>
          <div className="flex justify-center">
            <FollowButton followableType="artist" followableId={eventsData.artist.id} showCount={false} />
          </div>
        </div>
      )}
    </div>
  );
}
