import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete, apiPostForm } from "@/lib/api";

const PLANNED_EVENT_FEATURE_MESSAGE =
  "This Events feature is planned and not available in the current Tesotunes contract yet.";

// ============================================================================
// API Response Shapes (match Laravel paginator / EventResource format)
// ============================================================================

/** Standard Laravel paginator response from EventResource::collection() */
interface PaginatedEventsResponse {
  data: Record<string, unknown>[];
  links: Record<string, unknown>;
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

/** Admin wrapper response from GET /admin/events */
interface AdminEventsApiResponse {
  success: boolean;
  data: Record<string, unknown>[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/** Admin wrapper response from GET /admin/events/{id} */
interface AdminEventApiResponse {
  success: boolean;
  data: Record<string, unknown>;
}

// ============================================================================
// Types — aligned with EventResource.php in tesotunes-api
// ============================================================================

export interface EventTicketTier {
  id: number;
  name: string;
  description: string | null;
  price: number;
  price_ugx?: number;
  price_credits?: number;
  is_free: boolean;
  quantity: number | null;
  quantity_total?: number | null;
  quantity_sold?: number;
  available: number;
  max_per_order: number;
  sales_start_date?: string | null;
  sales_end_date?: string | null;
  is_active?: boolean;
  required_loyalty_tier?: string | null;
  tier_early_access_hours?: number | null;
}

/**
 * Event interface — aligned with EventResource.php from tesotunes-api.
 *
 * EventResource returns these exact fields. The frontend normalises
 * a few aliases (artwork → image, starts_at → date, venue_name → venue)
 * via `transformEvent()` for backward-compat with UI components.
 */
export interface Event {
  id: number;
  uuid?: string;
  title: string;
  slug: string;
  description: string;

  // Media — canonical event asset fields from EventResource
  artwork?: string;
  banner?: string;

  category: string;
  event_type?: string;

  // Schedule — canonical ISO-8601 strings
  starts_at?: string;
  ends_at?: string;
  doors_open_at?: string;
  timezone?: string;

  // Venue — canonical flat fields plus optional related location object
  venue_name?: string;
  venue_address?: string;
  city: string;
  country: string;
  location_obj?: {
    id: number;
    name: string;
    address?: string | null;
    city?: string | null;
  };

  // Capacity & status
  attendee_limit?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed' | 'postponed';
  is_virtual?: boolean;
  virtual_link?: string;
  is_free?: boolean;
  is_featured: boolean;
  is_published?: boolean;
  requires_approval?: boolean;

  // Pricing
  ticket_price?: number;
  currency?: string;

  // Organizer — EventResource returns nested { id, name, avatar }
  organizer?: {
    id: number;
    name: string;
    avatar?: string;
  };

  // Artist performing at event — mapped from organizer if organizer is an artist
  artist?: {
    id: number;
    name: string;
    slug?: string;
    image?: string;
  };

  // Ticket tiers — included when tickets relation is loaded (show endpoint)
  ticket_tiers?: EventTicketTier[];

  // Stats
  tickets_sold?: number;
  attendee_count?: number;
  rating_average?: number | null;
  review_count?: number;

  // Metadata
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

/**
 * Ticket — matches TicketController::myTickets() / show() response
 */
export interface Ticket {
  id: number;
  ticket_number: string;
  qr_code: string;
  status: 'pending' | 'confirmed' | 'attended' | 'cancelled';
  holder_name: string;
  holder_email?: string;
  holder_phone?: string;
  price_paid: number;
  price_paid_credits: number;
  payment_method: string;
  checked_in_at?: string | null;
  confirmed_at?: string | null;
  event?: {
    id: number;
    title: string;
    starts_at?: string;
    ends_at?: string;
    artwork?: string | null;
    venue_name?: string;
    city?: string;
  } | null;
  created_at: string;
}

export interface TicketsResponse {
  data: Ticket[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Purchase request — matches TicketController::purchase() validation
 */
export interface PurchaseTicketRequest {
  event_id: number;
  ticket_tier_id: number;
  quantity: number;
  payment_method: 'wallet' | 'mtn_momo' | 'airtel_money' | 'card' | 'credits';
  phone?: string;
  holder_name?: string;
  holder_email?: string;
  holder_phone?: string;
}

/**
 * Purchase response — matches TicketController::purchase() return shape
 */
export interface PurchaseTicketResponse {
  data: {
    order_id: string;
    tickets: Array<{
      id: number;
      ticket_number: string;
      qr_code: string;
      status: string;
      tier: string;
      price: number;
      holder_name: string;
    }>;
    total_amount: number;
    service_fee: number;
    payment_method: string;
    payment_reference: string | null;
    status: 'completed' | 'pending_payment';
  };
  message: string;
}

export interface CheckInRequest {
  ticket_number: string;
}

/**
 * Check-in response — matches TicketController::checkIn() return shape
 */
export interface CheckInResponse {
  message: string;
  data: {
    ticket_number: string;
    holder_name: string;
    checked_in_at: string;
    event: string | null;
    loyalty_points_earned: number;
  };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Transform a raw EventResource JSON object into our Event interface.
 * EventResource returns consistent field names — we only add convenience
 * aliases (artwork → image, starts_at → date, venue_name → venue) for
 * backward compatibility with UI components.
 */
function transformEvent(raw: Record<string, unknown>): Event {
  // Parse tags — backend may store as JSON string
  let tags: string[] | undefined;
  if (typeof raw.tags === 'string') {
    try { tags = JSON.parse(raw.tags); } catch { tags = undefined; }
  } else if (Array.isArray(raw.tags)) {
    tags = raw.tags as string[];
  }

  // Organizer is a nested object from EventResource
  const rawOrganizer = raw.organizer as { id: number; name: string; avatar?: string } | undefined;

  // Location is a nested object from EventResource
  const rawLocation = raw.location as { id: number; name: string; address?: string; city?: string } | undefined;

  // Ticket tiers are included when tickets relation is loaded
  const rawTiers = raw.ticket_tiers as EventTicketTier[] | undefined;

  return {
    id: raw.id as number,
    uuid: raw.uuid as string | undefined,
    title: (raw.title as string) || '',
    slug: (raw.slug as string) || '',
    description: (raw.description as string) || '',

    // Media: canonical event media fields
    artwork: raw.artwork as string | undefined,
    banner: raw.banner as string | undefined,

    category: (raw.category || '') as string,
    event_type: raw.event_type as string | undefined,

    // Schedule: canonical ISO-8601 fields
    starts_at: raw.starts_at as string | undefined,
    ends_at: raw.ends_at as string | undefined,
    doors_open_at: raw.doors_open_at as string | undefined,
    timezone: raw.timezone as string | undefined,

    // Venue: canonical flat fields with optional related location
    venue_name: raw.venue_name as string | undefined,
    venue_address: raw.venue_address as string | undefined,
    city: (raw.city || rawLocation?.city || '') as string,
    country: (raw.country || '') as string,
    location_obj: rawLocation ? {
      id: rawLocation.id,
      name: rawLocation.name,
      address: rawLocation.address,
      city: rawLocation.city,
    } : undefined,

    // Capacity & status
    attendee_limit: raw.attendee_limit as number | undefined,
    status: (raw.status || 'draft') as Event['status'],
    is_virtual: raw.is_virtual as boolean | undefined,
    virtual_link: raw.virtual_link as string | undefined,
    is_free: raw.is_free as boolean | undefined,
    is_featured: (raw.is_featured || false) as boolean,
    is_published: raw.is_published as boolean | undefined,
    requires_approval: raw.requires_approval as boolean | undefined,

    // Pricing
    ticket_price: raw.ticket_price as number | undefined,
    currency: raw.currency as string | undefined,

    // Organizer
    organizer: rawOrganizer,

    // Artist — map organizer as performing artist for backward compat
    artist: rawOrganizer ? {
      id: rawOrganizer.id,
      name: rawOrganizer.name,
      image: rawOrganizer.avatar,
    } : undefined,

    // Ticket tiers (from show endpoint)
    ticket_tiers: rawTiers,

    // Stats
    tickets_sold: raw.tickets_sold as number | undefined,
    attendee_count: raw.attendee_count as number | undefined,
    rating_average: raw.rating_average as number | null | undefined,
    review_count: raw.review_count as number | undefined,

    // Metadata
    tags,
    registration_deadline: raw.registration_deadline as string | undefined,
    published_at: raw.published_at as string | undefined,
    created_at: (raw.created_at || '') as string,
    updated_at: (raw.updated_at || '') as string,
  };
}

export function getEventImage(event: Event): string {
  return event.artwork || event.banner || '/images/placeholder-event.jpg';
}

export function getEventStartDate(event: Event): string | undefined {
  return event.starts_at;
}

export function getEventEndDate(event: Event): string | undefined {
  return event.ends_at;
}

export function getEventVenueLabel(event: Event): string {
  return event.venue_name || event.location_obj?.name || event.city || 'TBA';
}

export function getEventCityLabel(event: Event): string {
  return event.city || event.location_obj?.city || '';
}

export function getEventLocationSummary(event: Event): string {
  return [getEventCityLabel(event), event.country].filter(Boolean).join(', ');
}

export function getEventCapacity(event: Event): number {
  return event.attendee_limit || 0;
}

export function getEventOrganizerName(event: Event): string | undefined {
  return event.organizer?.name;
}

export function getEventTimeLabel(event: Event): string {
  if (!event.starts_at) {
    return 'TBA';
  }

  return new Date(event.starts_at).toLocaleTimeString('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * CreateEventRequest — matches ArtistEventsController::store() validation.
 * Supports both combined datetime (starts_at/ends_at) and split
 * (start_date + start_time) formats.
 */
export interface CreateEventRequest {
  title: string;
  description?: string;
  short_description?: string;
  category?: string;
  event_type?: string;
  // Date — backend accepts combined (starts_at/ends_at) or split (start_date + start_time)
  date?: string;          // alias → mapped to start_date in FormData
  time?: string;          // alias → mapped to start_time in FormData
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  starts_at?: string;
  ends_at?: string;
  timezone?: string;
  // Venue
  venue?: string;         // alias → mapped to venue_name in FormData
  venue_name?: string;
  venue_address?: string;
  location?: string;      // alias (used as city fallback)
  city?: string;
  country?: string;
  is_virtual?: boolean;
  is_online?: boolean;
  virtual_link?: string;
  online_url?: string;
  // Capacity
  capacity?: number;      // alias → mapped to attendee_limit in FormData
  attendee_limit?: number;
  max_capacity?: number;
  min_age?: number;
  is_free?: boolean;
  status?: string;
  // Files — sent via FormData
  image?: File;           // alias → mapped to cover_image in FormData
  cover_image?: File;
  banner_image?: File;    // alias → mapped to cover_image if no cover_image
  // Ticket tiers (sent as JSON string)
  ticket_tiers?: Array<{
    name: string;
    description?: string;
    price: number;
    price_credits?: number;
    quantity?: number;
    max_per_order?: number;
    sale_starts_at?: string;
    sale_ends_at?: string;
    // Backward compat field names
    sales_start_date?: string;
    sales_end_date?: string;
  }>;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: number;
}

// ============================================================================
// Public Events Hooks — aligned with PublicEventsController
// GET /events — paginated listing (EventResource::collection)
// GET /events/featured — featured events
// GET /events/upcoming — upcoming events
// GET /events/categories — distinct categories
// GET /events/{id} — event detail with ticket_tiers
// ============================================================================

export function useEvents(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  city?: string;
  status?: string;
  featured?: boolean;
  search?: string;
  month?: string;
}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      const res = await apiGet<PaginatedEventsResponse>("/events", { params });
      return {
        data: (res.data || []).map(transformEvent),
        pagination: res.meta,
      } as EventsResponse;
    },
  });
}

export function useEvent(eventId: number | string, options?: Partial<UseQueryOptions<Event>>) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await apiGet<{ data: Record<string, unknown> }>(`/events/${eventId}`);
      const eventData = (res.data ? res.data : res) as Record<string, unknown>;
      return transformEvent(eventData);
    },
    enabled: !!eventId,
    ...options,
  });
}

/**
 * Featured events — GET /events/featured
 * PublicEventsController returns is_featured=true events starting in the future, limit 6.
 */
export function useFeaturedEvents() {
  return useQuery({
    queryKey: ["events", "featured"],
    queryFn: async () => {
      const res = await apiGet<{ data: Record<string, unknown>[] }>("/events/featured");
      return (res.data || []).map(transformEvent);
    },
  });
}

/**
 * Upcoming events — GET /events/upcoming
 * PublicEventsController returns published events with starts_at >= now(), sorted by date.
 */
export function useUpcomingEvents(limit = 10) {
  return useQuery({
    queryKey: ["events", "upcoming", limit],
    queryFn: async () => {
      const res = await apiGet<{ data: Record<string, unknown>[] }>("/events/upcoming", {
        params: { limit },
      });
      return (res.data || []).map(transformEvent);
    },
  });
}

// ============================================================================
// Ticket Hooks — aligned with TicketController
// POST /tickets/purchase — purchase tickets
// GET /tickets/my — user's tickets
// GET /tickets/{id} — ticket detail
// GET /tickets/validate/{ticketNumber} — validate a ticket
// POST /tickets/check-in — check in a ticket
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
    queryFn: () => apiGet<{ data: Ticket }>(`/tickets/${ticketId}`).then(res => res.data),
    enabled: !!ticketId,
  });
}

// ============================================================================
// Check-in Hooks — aligned with TicketController
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
    queryFn: () => apiGet<{ valid: boolean; data?: Record<string, unknown>; message?: string }>(`/tickets/validate/${ticketNumber}`),
    enabled: !!ticketNumber && ticketNumber.length > 5,
  });
}

// ============================================================================
// Artist Event Management Hooks — aligned with ArtistEventsController
// GET /artist/events — artist's own events
// POST /artist/events — create event
// GET /artist/events/{id} — show with ticket_tiers + attendees
// PUT /artist/events/{id} — update event
// DELETE /artist/events/{id} — delete event
// GET /artist/events/{id}/analytics — event analytics
// ============================================================================

export function useArtistEvents(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["artist", "events", params],
    queryFn: async () => {
      const res = await apiGet<PaginatedEventsResponse>("/artist/events", { params });
      return {
        data: (res.data || []).map(transformEvent),
        pagination: res.meta,
      } as EventsResponse;
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => {
      const formData = new FormData();

      // Map alias fields to backend-accepted field names
      const fieldMap: Record<string, string> = {
        date: 'start_date',
        time: 'start_time',
        venue: 'venue_name',
        capacity: 'attendee_limit',
        image: 'cover_image',
        banner_image: 'cover_image', // banner uses same upload field
      };

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'ticket_tiers') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'location') {
          // 'location' is used as city fallback
          if (!data.city && typeof value === 'string') {
            formData.append('city', value);
          }
        } else if (value instanceof File) {
          const mappedKey = fieldMap[key] || key;
          formData.append(mappedKey, value);
        } else if (value !== undefined && value !== null) {
          const mappedKey = fieldMap[key] || key;
          formData.append(mappedKey, String(value));
        }
      });
      return apiPostForm<{ message: string; data: Record<string, unknown> }>("/artist/events", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
      return apiPostForm<{ message: string; data: Record<string, unknown> }>(`/artist/events/${id}`, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Event analytics — GET /artist/events/{id}/analytics
 * Returns tickets_sold, revenue, check_ins, by_tier, by_date.
 */
export function useEventAnalytics(eventId: number | string) {
  return useQuery({
    queryKey: ["artist", "events", eventId, "analytics"],
    queryFn: () => apiGet<{
      data: {
        tickets_sold: number;
        revenue: number;
        revenue_credits: number;
        check_ins: number;
        by_tier: Array<{ name: string; sold: number; total: number | null; revenue: number }>;
        by_date: Array<{ date: string; revenue: number; count: number }>;
      };
    }>(`/artist/events/${eventId}/analytics`),
    enabled: !!eventId,
  });
}

// ============================================================================
// Event Categories — GET /events/categories
// PublicEventsController returns distinct categories from the database.
// ============================================================================

export function useEventCategories() {
  return useQuery({
    queryKey: ["event", "categories"],
    queryFn: async () => {
      const res = await apiGet<{ data: string[] }>("/events/categories");
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Social & Engagement Hooks
// ============================================================================

/**
 * Trending events — no dedicated backend endpoint.
 * Falls back to upcoming events sorted by tickets_sold.
 */
export function useTrendingEvents(limit = 20) {
  return useQuery({
    queryKey: ["events", "trending", limit],
    queryFn: async () => {
      const res = await apiGet<{ data: Record<string, unknown>[] }>("/events/upcoming", {
        params: { limit },
      });
      const events = (res.data || []).map(transformEvent);
      return events.sort((a, b) => (b.tickets_sold || 0) - (a.tickets_sold || 0));
    },
  });
}

/**
 * Event recommendations — no dedicated backend endpoint yet.
 * Returns empty structure as placeholder.
 */
export function useEventRecommendations() {
  return useQuery({
    queryKey: ["events", "recommendations"],
    queryFn: async () => ({
      for_you: [] as Event[],
      trending: [] as Event[],
      friends_attending: [] as Event[],
      based_on_history: [] as Event[],
    }),
    staleTime: Infinity,
  });
}

// ============================================================================
// Event Interactions — aligned with ActivityInteractionController
// POST /events/{id}/interest — toggle interest
// POST /bookmark/event/{id} — toggle bookmark (requires 'event' type in backend)
// POST /like/event/{id} — toggle like (requires 'event' type in backend)
// ============================================================================

export function useToggleEventInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) =>
      apiPost<{ data: { interested: boolean; event_id: number }; message: string }>(`/events/${eventId}/interest`),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useToggleEventBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) =>
      apiPost<{ data: { bookmarked: boolean }; message: string }>(`/bookmark/event/${eventId}`),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
}

/**
 * Share tracking — no dedicated backend endpoint yet.
 * Resolves silently; will be connected once backend supports it.
 */
export function useTrackEventShare() {
  return useMutation({
    mutationFn: async (_eventId: number) => ({ success: true }),
  });
}

// ============================================================================
// Checkout Hooks
// The backend uses a single POST /tickets/purchase endpoint.
// useInitiateCheckout and useCompleteCheckout are convenience wrappers
// that map to the same underlying endpoint for the UI's multi-step flow.
// ============================================================================

/**
 * Initiate checkout — prepares order summary.
 * This is a frontend-only step; the backend processes everything in one call.
 * Returns a calculated summary the caller can display before confirming.
 */
export function useInitiateCheckout() {
  return useMutation({
    mutationFn: async (data: {
      event_id: number;
      tickets: Array<{ ticket_tier_id: number; quantity: number }>;
      payment_method: PurchaseTicketRequest['payment_method'];
    }) => {
      if (data.tickets.length !== 1) {
        throw new Error("One ticket tier per checkout is currently supported.");
      }

      // For the multi-step UI, we just validate availability via the event detail
      const res = await apiGet<{ data: Record<string, unknown> }>(`/events/${data.event_id}`);
      const event = transformEvent((res.data || res) as Record<string, unknown>);
      const tiers = event.ticket_tiers || [];

      let totalUgx = 0;
      let totalCredits = 0;
      for (const item of data.tickets) {
        const tier = tiers.find(t => t.id === item.ticket_tier_id);
        if (tier) {
          totalUgx += (tier.price || 0) * item.quantity;
          totalCredits += (tier.price_credits || 0) * item.quantity;
        }
      }
      const platformFee = Math.round(totalUgx * 0.05);

      return {
        checkout_id: `checkout_${Date.now()}`,
        total_ugx: totalUgx + platformFee,
        total_credits: totalCredits,
        platform_fee: platformFee,
        discount_amount: 0,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    },
  });
}

/**
 * Complete checkout — calls POST /tickets/purchase.
 * Purchases the first ticket tier in the cart via the backend's ticket purchase endpoint.
 */
export function useCompleteCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      event_id: number;
      checkout_id: string;
      payment_provider: PurchaseTicketRequest['payment_method'];
      payment_details: Record<string, unknown>;
      phone_number?: string;
      // The actual ticket info
      ticket_tier_id: number;
      quantity: number;
      holder_name?: string;
      holder_email?: string;
    }) => {
      const purchaseData: PurchaseTicketRequest = {
        event_id: data.event_id,
        ticket_tier_id: data.ticket_tier_id,
        quantity: data.quantity,
        payment_method: data.payment_provider as PurchaseTicketRequest['payment_method'],
        phone: data.phone_number,
        holder_name: data.holder_name,
        holder_email: data.holder_email,
      };
      return apiPost<PurchaseTicketResponse>("/tickets/purchase", purchaseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

// ============================================================================
// Group Booking Hooks — no backend endpoint yet
// These are placeholders for the UI; will error until implemented server-side.
// ============================================================================

export function useCreateGroupBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_data: {
      event_id: number;
      ticket_tier_id: number;
      total_seats: number;
      payment_split: 'equal' | 'custom' | 'organizer_pays';
      deadline?: string;
    }) => {
      throw new Error(PLANNED_EVENT_FEATURE_MESSAGE);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["group-bookings"] });
    },
  });
}

export function useGroupBooking(eventId: number | string, groupId: string) {
  return useQuery({
    queryKey: ["group-booking", eventId, groupId],
    queryFn: async () => {
      throw new Error(PLANNED_EVENT_FEATURE_MESSAGE);
    },
    enabled: !!eventId && !!groupId,
    retry: false,
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_data: { event_id: number; group_id: string }) => {
      throw new Error(PLANNED_EVENT_FEATURE_MESSAGE);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["group-bookings"] });
    },
  });
}

// Discount Code Validation — no backend endpoint yet
export function useValidateDiscountCode() {
  return useMutation({
    mutationFn: async (_data: { event_id: number; code: string }) => {
      throw new Error(PLANNED_EVENT_FEATURE_MESSAGE);
    },
  });
}

// Live Event Check-in — no backend endpoint yet
export function useLiveCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_data: {
      event_id: number;
      latitude?: number;
      longitude?: number;
    }) => {
      throw new Error(PLANNED_EVENT_FEATURE_MESSAGE);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
