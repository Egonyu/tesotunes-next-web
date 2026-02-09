import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface EventTicketTier {
  id: number;
  event_id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  available: number;
  max_per_order: number;
  sales_start_date?: string;
  sales_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  banner_image?: string;
  category: string;
  date: string;
  end_date?: string;
  time: string;
  venue: string;
  location: string;
  city: string;
  country: string;
  capacity?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  artist_id?: number;
  artist?: {
    id: number;
    name: string;
    slug: string;
    image?: string;
  };
  ticket_tiers?: EventTicketTier[];
  tickets_sold?: number;
  is_featured: boolean;
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
  payment_method: 'wallet' | 'mtn_momo' | 'airtel_money' | 'card';
  phone?: string;
  holder_name: string;
  holder_email: string;
  holder_phone?: string;
}

export interface PurchaseTicketResponse {
  success: boolean;
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
  success: boolean;
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
    queryFn: () => apiGet<EventsResponse>("/events", { params }),
  });
}

export function useEvent(eventId: number | string, options?: UseQueryOptions<Event>) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => apiGet<Event>(`/events/${eventId}`),
    enabled: !!eventId,
    ...options,
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ["events", "featured"],
    queryFn: () => apiGet<Event[]>("/events/featured"),
  });
}

export function useUpcomingEvents(limit = 10) {
  return useQuery({
    queryKey: ["events", "upcoming", limit],
    queryFn: () => apiGet<Event[]>("/events/upcoming", { params: { limit } }),
  });
}

// ============================================================================
// Ticket Purchase Hooks
// ============================================================================

export function usePurchaseTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseTicketRequest) =>
      apiPost<PurchaseTicketResponse>("/tickets/purchase", data),
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
    queryFn: () => apiGet<TicketsResponse>("/tickets/my", { params }),
  });
}

export function useTicket(ticketId: number | string) {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => apiGet<Ticket>(`/tickets/${ticketId}`),
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
      apiPost<CheckInResponse>("/tickets/check-in", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useValidateTicket(ticketNumber: string) {
  return useQuery({
    queryKey: ["ticket", "validate", ticketNumber],
    queryFn: () => apiGet<{ valid: boolean; ticket?: Ticket; message: string }>(`/tickets/validate/${ticketNumber}`),
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
    queryFn: () => apiGet<EventsResponse>("/artist/events", { params }),
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
      return apiPost<Event>("/artist/events", formData);
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
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'ticket_tiers') {
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      return apiPut<Event>(`/artist/events/${id}`, formData);
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
      apiDelete(`/artist/events/${eventId}`),
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
    }>(`/artist/events/${eventId}/analytics`),
    enabled: !!eventId,
  });
}

// ============================================================================
// Event Categories Hook
// ============================================================================

export function useEventCategories() {
  return useQuery({
    queryKey: ["event", "categories"],
    queryFn: () => apiGet<string[]>("/events/categories"),
  });
}
