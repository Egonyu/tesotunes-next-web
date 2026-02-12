'use client';

import { useState } from 'react'; import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, QrCode, Download, Filter, Search } from 'lucide-react';
import { useMyTickets, type TicketsResponse } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  valid: 'text-green-500 bg-green-500/10',
  used: 'text-gray-500 bg-gray-500/10',
  cancelled: 'text-red-500 bg-red-500/10',
  expired: 'text-orange-500 bg-orange-500/10',
};

export default function MyTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: ticketsResponse, isLoading } = useMyTickets({
    page: currentPage,
    per_page: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  
  const tickets = ticketsResponse?.data || [];
  const pagination = ticketsResponse?.pagination;
  
  const filteredTickets = tickets.filter(ticket =>
    ticket.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
        <p className="text-muted-foreground">
          View and manage your event tickets
        </p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border bg-background"
          >
            <option value="all">All Status</option>
            <option value="valid">Valid</option>
            <option value="used">Used</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>
      
      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16">
          <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Tickets Found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'No tickets match your search criteria'
              : "You haven't purchased any tickets yet"}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="block p-4 rounded-xl border bg-card hover:border-primary transition-colors"
            >
              <div className="flex gap-4">
                {/* Event Image */}
                <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={ticket.event.artwork || ticket.event.image || '/images/event-placeholder.jpg'}
                    alt={ticket.event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Ticket Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{ticket.event.title}</h3>
                      <p className="text-sm text-muted-foreground">{ticket.ticket_tier.name}</p>
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium capitalize',
                        statusColors[ticket.status]
                      )}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(ticket.event.starts_at || ticket.event.date).toLocaleDateString('en', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {ticket.event.time || (ticket.event.starts_at ? new Date(ticket.event.starts_at).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBA')}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {ticket.event.venue_name || ticket.event.venue || ticket.event.city || 'TBA'}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      #{ticket.ticket_number}
                    </span>
                    {ticket.checked_in_at && (
                      <span className="text-xs text-green-500">
                        ✓ Checked in {new Date(ticket.checked_in_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* QR Code Preview */}
                <div className="flex items-center">
                  <QrCode className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {pagination.last_page}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
            disabled={currentPage === pagination.last_page}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
