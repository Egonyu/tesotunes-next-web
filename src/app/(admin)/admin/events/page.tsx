'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Users,
  Ticket,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet } from '@/lib/api';

interface Event {
  id: number;
  title: string;
  venue: string;
  venue_name?: string;
  location: string;
  city?: string;
  country?: string;
  image: string;
  artwork?: string;
  date: string;
  starts_at?: string;
  ticketsSold: number;
  tickets_sold?: number;
  capacity: number;
  attendee_limit?: number;
  revenue: number | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'draft' | 'published' | 'postponed';
}

interface EventStats {
  upcoming_count: number;
  tickets_sold_30d: number;
  revenue_30d: number;
  avg_attendance: number;
}

interface PaginatedEvents {
  data: Event[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ['admin', 'events', 'stats'],
    queryFn: () => apiGet<EventStats | { data: EventStats }>('/admin/events/stats')
      .then(res => ('data' in res && res.data) ? res.data as EventStats : res as EventStats),
    staleTime: 60 * 1000,
  });

  const { data: eventsRes, isLoading } = useQuery({
    queryKey: ['admin', 'events', { search: searchQuery, status: statusFilter, month: monthFilter, page }],
    queryFn: () => apiGet<PaginatedEvents | Event[]>('/admin/events', {
      params: {
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        month: monthFilter || undefined,
        page,
        per_page: 10,
      },
    }).then(res => {
      if (Array.isArray(res)) return { data: res, meta: undefined };
      return res as PaginatedEvents;
    }),
  });

  const events = eventsRes?.data || [];
  const meta = eventsRes?.meta;
  
  const statusStyles: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    ongoing: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    postponed: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  };

  const formatRevenue = (val: number | undefined | null) => {
    if (val == null || isNaN(val)) return '—';
    if (val >= 1000000000) return `UGX ${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `UGX ${(val / 1000000).toFixed(0)}M`;
    return `UGX ${val.toLocaleString()}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage concerts and events</p>
        </div>
        <Link
          href="/admin/events/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats?.upcoming_count?.toLocaleString() ?? '—'}</p>
          <p className="text-sm text-muted-foreground">Upcoming Events</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats?.tickets_sold_30d?.toLocaleString() ?? '—'}</p>
          <p className="text-sm text-muted-foreground">Tickets Sold (30d)</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{formatRevenue(stats?.revenue_30d)}</p>
          <p className="text-sm text-muted-foreground">Revenue (30d)</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">
            {stats?.avg_attendance !== undefined ? `${stats.avg_attendance}%` : '—'}
          </p>
          <p className="text-sm text-muted-foreground">Avg. Attendance</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        />
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try different search terms' : 'Create your first event to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const sold = event.ticketsSold ?? event.tickets_sold ?? 0;
            return (
              <div key={event.id} className="flex flex-col md:flex-row rounded-xl border bg-card overflow-hidden">
                <div className="relative w-full md:w-48 h-48 md:h-auto bg-muted shrink-0">
                  <Image
                    src={event.artwork || event.image || '/images/placeholder.jpg'}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium capitalize shrink-0',
                      statusStyles[event.status] || statusStyles.draft
                    )}>
                      {event.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.starts_at || event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.venue_name || event.venue || 'TBD'}{event.city || event.location ? `, ${event.city || event.location}` : ''}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center p-2 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{sold.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Sold</p>
                    </div>
                    <div>
                      <p className="font-semibold">{(event.attendee_limit || event.capacity || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Capacity</p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {(event.attendee_limit || event.capacity || 0) > 0 ? Math.round((sold / (event.attendee_limit || event.capacity || 1)) * 100) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Filled</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {formatRevenue(event.revenue)} revenue
                    </p>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="p-2 hover:bg-muted rounded-lg"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="p-2 hover:bg-muted rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((meta.current_page - 1) * meta.per_page) + 1}-{Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} events
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'px-3 py-1 rounded-lg',
                    page === pageNum ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            {meta.last_page > 5 && (
              <>
                <span className="px-2">...</span>
                <button
                  onClick={() => setPage(meta.last_page)}
                  className={cn(
                    'px-3 py-1 rounded-lg',
                    page === meta.last_page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                >
                  {meta.last_page}
                </button>
              </>
            )}
            <button
              onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
