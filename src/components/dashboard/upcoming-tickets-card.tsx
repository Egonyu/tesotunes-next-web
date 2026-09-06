'use client';

import Link from 'next/link';
import { Ticket, Calendar, ArrowRight } from 'lucide-react';
import { useMyTickets } from '@/hooks/useEvents';
import { formatDate } from '@/lib/utils';

/**
 * Upcoming tickets on the dashboard.
 *
 * The dashboard covered wallet, earnings and contributions but never mentioned
 * a ticket the member had paid for, so a bought ticket had nowhere to surface
 * and the QR code needed at the door was effectively lost after checkout.
 */
export function UpcomingTicketsCard() {
  const { data, isLoading } = useMyTickets({ per_page: 3, status: 'valid' });

  const tickets = (data?.data ?? []).filter((ticket) => {
    const startsAt = ticket.event?.starts_at;
    return startsAt ? new Date(startsAt) >= new Date() : true;
  });

  if (isLoading) {
    return <div className="rounded-2xl border bg-card p-5 h-32 animate-pulse bg-muted/40" />;
  }

  // Nothing bought yet is not worth a card — it would just add noise for the
  // many members who never buy a ticket.
  if (tickets.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Your upcoming events</h2>
        </div>
        <Link
          href="/tickets"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          All tickets
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ul className="space-y-2">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <Link
              href={`/tickets/${ticket.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{ticket.event?.title ?? 'Event'}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {ticket.event?.starts_at ? formatDate(ticket.event.starts_at) : 'Date to be announced'}
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground shrink-0">
                {ticket.ticket_number}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground mt-3">
        Open a ticket to show its QR code at the entrance.
      </p>
    </section>
  );
}
