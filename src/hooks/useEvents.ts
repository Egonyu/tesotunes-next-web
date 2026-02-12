import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete, apiPostForm } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface EventTicketTier {
  id: number;
  event_id: number;
  name: string;
  description: string;
  price: number;
  price_ugx?: number;
  price_credits?: number;
  is_free?: boolean;
  quantity: number;
  quantity_total?: number;
  quantity_sold?: number;
  available: number;
  max_per_order: number;
  sales_start_date?: string;
  sales_end_date?: string;
  is_active?: boolean;
  required_loyalty_tier?: string;
  tier_early_access_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  uuid?: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  artwork?: string;
  banner?: string;
  banner_image?: string;
  category: string;
  event_type?: string;
  date: string;
  end_date?: string;
  starts_at?: string;
  ends_at?: string;
  doors_open_at?: string;
  time: string;
  timezone?: string;
  venue: string;
  venue_name?: string;
  venue_address?: string;
  location: string;
  city: string;
  country: string;
  capacity?: number;
  attendee_limit?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed' | 'postponed';
  is_virtual?: boolean;
  virtual_link?: string;
  is_free?: boolean;
  is_featured: boolean;
  is_published?: boolean;
  ticket_price?: number;
  currency?: string;
  artist_id?: number;
  artist?: {
    id: number;
    name: string;
    slug: string;
    image?: string;
  };
  organizer?: {
    id: number;
    name: string;
    avatar?: string;
  };
  ticket_tiers?: EventTicketTier[];
  tickets_sold?: number;
  attendee_count?: number;
  rating_average?: number;
  review_count?: number;
  tags?: string[];
  registration_deadline?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EventsResponse {
  data: Event[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface Ticket {
  id: number;
  event_id: number;
  event: Event;
  ticket_tier_id: number;
  ticket_tier: EventTicketTier;
  order_id: number;
  ticket_number: string;
  qr_code: string;
  status: 'valid' | 'used' | 'cancelled' | 'expired';
  holder_name: string;
  holder_email: string;
  holder_phone?: string;
  checked_in_at?: string;
  checked_in_by?: number;
  created_at: string;
  updated_at: string;
}

export interface TicketsResponse {
  data: Ticket[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PurchaseTicketRequest {
  event_id: number;
  ticket_tier_id: number;
  quantity: number;
  payment_method: 'wallet' | 'mtn_momo' | 'airtel_money' | 'card' | 'credits';
  phone?: string;
  holder_name: string;
  holder_email: string;
  holder_phone?: string;
}

export interface PurchaseTicketResponse {
    order_id: number;
  tickets: Ticket[];
  total_amount: number;
  payment_reference?: string;
  message: string;
}

export interface CheckInRequest {
  ticket_number: string;
}

export interface CheckInResponse {
    ticket: Ticket;
  message: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  category: string;
  date: string;
  end_date?: string;
  time: string;
  venue: string;
  location: string;
  city: string;
  country: string;
  capacity?: number;
  image?: File;
  banner_image?: File;
  ticket_tiers: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    max_per_order: number;
    sales_start_date?: string;
    sales_end_date?: string;
  }[];
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: number;
}

// ============================================================================
// Events Hooks
// ============================================================================

export function useEvents(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  city?: string;
  status?: string;
  featured?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => apiGet<EventsResponse>("/api/events", { params }),
  });
}

export function useEvent(eventId: number | string, options?: UseQueryOptions<Event>) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => apiGet<{ data: Event }>(`/api/events/${eventId}`).then(res => res.data),
    enabled: !!eventId,
    ...options,
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ["events", "featured"],
    queryFn: async () => {
      const res = await apiGet<{ data: Event[] }>("/api/events/featured");
      return res.data;
    },
  });
}

export function useUpcomingEvents(limit = 10) {
  return useQuery({
    queryKey: ["events", "upcoming", limit],
    queryFn: async () => {
      const res = await apiGet<{ data: Event[] }>("/api/events/upcoming", { params: { limit } });
      return res.data;
    },
  });
}

// ============================================================================
// Ticket Purchase Hooks
// ============================================================================

export function usePurchaseTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseTicketRequest) =>
      apiPost<PurchaseTicketResponse>("/api/tickets/purchase", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useMyTickets(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): UseQueryResult<TicketsResponse> {
  return useQuery({
    queryKey: ["tickets", "my", params],
    queryFn: () => apiGet<TicketsResponse>("/api/tickets/my", { params }),
  });
}

export function useTicket(ticketId: number | string) {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => apiGet<{ data: Ticket }>(`/api/tickets/${ticketId}`).then(res => res.data),
    enabled: !!ticketId,
  });
}

// ============================================================================
// Check-in Hooks
// ============================================================================

export function useCheckInTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInRequest) =>
      apiPost<CheckInResponse>("/api/tickets/check-in", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useValidateTicket(ticketNumber: string) {
  return useQuery({
    queryKey: ["ticket", "validate", ticketNumber],
    queryFn: () => apiGet<{ valid: boolean; ticket?: Ticket; message: string }>(`/api/tickets/validate/${ticketNumber}`),
    enabled: !!ticketNumber && ticketNumber.length > 5,
  });
}

// ============================================================================
// Artist Event Management Hooks
// ============================================================================

export function useArtistEvents(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["artist", "events", params],
    queryFn: () => apiGet<EventsResponse>("/api/artist/events", { params }),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'ticket_tiers') {
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      return apiPostForm<Event>("/api/artist/events", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateEventRequest) => {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'ticket_tiers') {
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      return apiPostForm<Event>(`/api/artist/events/${id}`, formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) =>
      apiDelete(`/api/artist/events/${eventId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events"] });
    },
  });
}

export function useEventAnalytics(eventId: number | string) {
  return useQuery({
    queryKey: ["artist", "events", eventId, "analytics"],
    queryFn: () => apiGet<{
      tickets_sold: number;
      revenue: number;
      check_ins: number;
      by_tier: Array<{ tier_name: string; sold: number; revenue: number }>;
      by_date: Array<{ date: string; sold: number }>;
    }>(`/api/artist/events/${eventId}/analytics`),
    enabled: !!eventId,
  });
}

// ============================================================================
// Event Categories Hook
// ============================================================================

export function useEventCategories() {
  return useQuery({
    queryKey: ["event", "categories"],
    queryFn: async () => {
      const res = await apiGet<{ data: string[] }>("/api/events/categories");
      return res.data;
    },
  });
}
