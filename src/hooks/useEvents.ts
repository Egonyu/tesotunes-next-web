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
  quantity_external_allocated?: number;
  available: number;
  max_per_order: number;
  sales_start_date?: string | null;
  sales_end_date?: string | null;
  is_active?: boolean;
  required_loyalty_tier?: string | null;
  tier_early_access_hours?: number | null;
}

export interface EventDiscountCode {
  id: number;
  name?: string | null;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  max_discount_ugx?: number | null;
  usage_limit?: number | null;
  usage_count?: number;
  min_order_amount_ugx?: number | null;
  applies_to_ticket_ids?: number[];
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
}

export interface EventStaffMember {
  id: number | string;
  user_id: number;
  role: 'organizer' | 'finance' | 'check_in_staff' | 'promoter' | 'analyst';
  role_label: string;
  notes?: string | null;
  assigned_at?: string | null;
  user?: {
    id: number;
    name: string;
    email?: string;
    username?: string;
    avatar?: string;
  } | null;
}

export interface TicketSupportCase {
  id: number;
  case_type: 'refund_request' | 'payment_dispute';
  dispute_category?: string | null;
  status: 'open' | 'approved' | 'rejected' | 'resolved';
  escalation_status?: 'none' | 'review' | 'resolved';
  reason: string;
  gateway_reference?: string | null;
  evidence_url?: string | null;
  evidence_notes?: string | null;
  resolution_notes?: string | null;
  requested_refund_amount?: number | null;
  approved_refund_amount?: number | null;
  created_at?: string;
  resolved_at?: string | null;
  attendee?: {
    id: number;
    ticket_number: string;
    status: string;
    holder_name: string;
    holder_email?: string | null;
    holder_phone?: string | null;
    price_paid?: number;
    ticket_tier?: {
      id: number;
      name: string;
    } | null;
  } | null;
  requested_by?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  resolved_by?: {
    id: number;
    name: string;
    email?: string;
  } | null;
}

export interface OfflineSaleOrder {
  order_id: string;
  status: 'active' | 'voided';
  sale_source?: 'printed_ticket' | 'door_sale' | 'phone_booking' | 'complimentary' | string | null;
  notes?: string | null;
  validation_notes?: string | null;
  printed_ticket_import?: boolean;
  last_synced_at?: string | null;
  holder_name?: string | null;
  holder_email?: string | null;
  holder_phone?: string | null;
  logged_at?: string | null;
  quantity: number;
  checked_in_count: number;
  voided_count: number;
  unit_price_ugx: number;
  total_amount: number;
  ticket_tier?: {
    id: number;
    name: string;
  } | null;
  ticket_numbers: string[];
}

export interface ExternalAllocation {
  id: number;
  channel: string;
  channel_label: string;
  quantity: number;
  notes?: string | null;
  status: "active" | "released";
  created_at?: string | null;
  released_at?: string | null;
  release_reason?: string | null;
  ticket_tier?: {
    id: number;
    name: string;
    available?: number;
  } | null;
  logged_by?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  released_by?: {
    id: number;
    name: string;
    email?: string;
  } | null;
}

export interface EventPromotionRequest {
  id: number;
  uuid?: string;
  promotion_slug?: string | null;
  promotion_title: string;
  promotion_type?: string | null;
  promotion_platform?: string | null;
  price_credits: number;
  price_ugx: number;
  status: "pending" | "active" | "rejected";
  request_notes?: string | null;
  moderation_notes?: string | null;
  featured_image_url?: string | null;
  requested_at?: string | null;
  moderated_at?: string | null;
  requested_by?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  moderated_by?: {
    id: number;
    name: string;
    email?: string;
  } | null;
}

export interface EventTicketingSummary {
  mode_label: string;
  tesotunes_checkout_enabled: boolean;
  manual_reconciliation_enabled: boolean;
  has_external_allocations: boolean;
  total_capacity?: number | null;
  tesotunes_sold: number;
  tesotunes_available?: number | null;
  external_allocated: number;
  online_sell_through_percent: number;
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
  ticketing_mode?: 'tesotunes_managed' | 'hybrid' | 'external_only' | 'free_rsvp';
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
  discount_codes?: EventDiscountCode[];
  staff_members?: EventStaffMember[];
  waitlist_count?: number;
  waitlist_joined?: boolean;

  // Stats
  tickets_sold?: number;
  attendee_count?: number;
  rating_average?: number | null;
  review_count?: number;

  // Metadata
  tags?: string[];
  registration_deadline?: string;
  refund_policy?: string;
  cancellation_policy?: string;
  requirements?: string[];
  contact_info?: {
    support_email?: string;
    support_phone?: string;
    invoice_issuer_name?: string;
    invoice_support_email?: string;
    tax_registration_number?: string;
    tax_rate_percent?: number;
    tax_is_inclusive?: boolean;
    age_restriction?: string;
    door_notes?: string;
    tax_vat_notes?: string;
  };
  website?: string;
  social_links?: Record<string, string>;
  marketing_settings?: {
    campaign_spend?: Array<{
      key?: string;
      label: string;
      amount: number;
      notes?: string | null;
      currency?: string;
    }>;
    campaign_presets?: Array<{
      key?: string;
      name: string;
      source: string;
      medium: string;
      channel?: string;
      campaign_code: string;
      notes?: string | null;
    }>;
  };
  promotion_requests?: EventPromotionRequest[];
  ticketing_summary?: EventTicketingSummary;
  operations?: {
    registration_deadline?: string;
    refund_policy?: string;
    cancellation_policy?: string;
    support_email?: string;
    support_phone?: string;
    invoice_issuer_name?: string;
    invoice_support_email?: string;
    tax_registration_number?: string;
    tax_rate_percent?: number;
    tax_is_inclusive?: boolean;
    age_restriction?: string;
    door_notes?: string;
    tax_vat_notes?: string;
    requirements?: string[];
    website?: string;
  };
  payout_center?: {
    setup_complete: boolean;
    money_payout_enabled: boolean;
    minimum_payout: number;
    verification_status: string;
    method?: string | null;
    method_label?: string | null;
    mobile_money_provider?: string | null;
    mobile_money_number?: string | null;
    bank_name?: string | null;
    bank_account_masked?: string | null;
    pending_balance: number;
    ready_balance: number;
    settled_balance: number;
    failed_balance: number;
    entry_count: number;
    latest_ready_at?: string | null;
    latest_paid_out_at?: string | null;
  };
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
  metadata?: {
    order_id?: string;
    attribution?: Record<string, unknown> | null;
    fee_breakdown?: TicketQuote | null;
    support_cases?: Array<{
      case_id: number;
      case_type: 'refund_request' | 'payment_dispute';
      decision: string;
      resolved_at: string;
      approved_refund_amount?: number | null;
      resolution_notes?: string | null;
    }>;
    wallet_actions?: {
      resend_count?: number;
      last_resent_at?: string;
      last_resent_to?: string;
      transfer_history?: Array<{
        transferred_at: string;
        from?: {
          name?: string | null;
          email?: string | null;
          phone?: string | null;
        };
        to?: {
          name?: string | null;
          email?: string | null;
          phone?: string | null;
        };
        message?: string | null;
      }>;
      last_transferred_at?: string;
    };
  } | null;
  created_at: string;
}

export interface TicketInvoice {
  invoice_number: string;
  issued_at?: string | null;
  currency: string;
  status: string;
  event?: {
    id?: number | null;
    title?: string | null;
    starts_at?: string | null;
    venue_name?: string | null;
    city?: string | null;
    country?: string | null;
  } | null;
  ticket?: {
    id: number;
    ticket_number: string;
    tier_name?: string | null;
    holder_name?: string | null;
    holder_email?: string | null;
    holder_phone?: string | null;
    payment_method?: string | null;
    payment_reference?: string | null;
    order_id?: string | null;
  } | null;
  issuer?: {
    name?: string | null;
    support_email?: string | null;
    support_phone?: string | null;
    tax_registration_number?: string | null;
  } | null;
  buyer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  line_items: Array<{
    label: string;
    quantity: number;
    unit_price: number;
    base_amount: number;
    service_fee: number;
    total_amount: number;
  }>;
  tax: {
    rate_percent: number;
    inclusive: boolean;
    amount: number;
    notes?: string | null;
  };
  totals: {
    subtotal: number;
    service_fee: number;
    tax_amount: number;
    total_paid: number;
  };
}

export interface SavedAttendeeProfile {
  name: string;
  email?: string | null;
  phone?: string | null;
  last_used_at?: string | null;
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
  ticket_tier_id?: number;
  quantity?: number;
  discount_code?: string;
  tickets?: Array<{
    ticket_tier_id: number;
    quantity: number;
  }>;
  payment_method: 'wallet' | 'mtn_momo' | 'card' | 'credits';
  phone?: string;
  holder_name?: string;
  holder_email?: string;
  holder_phone?: string;
  attendee_assignments?: Array<{
    ticket_tier_id: number;
    attendees: Array<{
      name?: string;
      email?: string;
      phone?: string;
      save_profile?: boolean;
    }>;
  }>;
  attribution?: {
    source?: string;
    channel?: string;
    campaign_code?: string;
    referral_code?: string;
    promoter_code?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    landing_page?: string;
  };
}

export interface TrackEventFunnelRequest {
  stage: "visit" | "checkout_start";
  session_key: string;
  source?: string;
  channel?: string;
  campaign_code?: string;
  referral_code?: string;
  promoter_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_page?: string;
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
      holder_email?: string;
    }>;
    total_amount: number;
    base_amount: number;
    service_fee: number;
    fee_breakdown: TicketQuote;
    line_items?: TicketQuoteItem[];
    payment_method: string;
    payment_reference: string | null;
    status: 'completed' | 'pending_payment';
  };
  message: string;
}

export interface TicketQuoteItem {
  ticket_tier_id: number;
  ticket_tier_name: string;
  quantity: number;
  currency: string;
  unit_price_ugx: number;
  unit_price_credits: number;
  base_amount: number;
  discount_amount?: number;
  discounted_base_amount?: number;
  total_credits: number;
  platform_commission_percent: number;
  platform_commission_amount: number;
  processing_fee_percent: number;
  processing_fee_amount: number;
  total_fee_amount: number;
  total_amount: number;
  organizer_net_amount: number;
  fee_source: string;
  organizer_plan?: {
    id: number;
    name: string;
    slug?: string;
    tier?: string;
  } | null;
  discount_code?: {
    id: number;
    code: string;
    name?: string | null;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
  } | null;
}

export interface TicketQuote {
  event_id?: number;
  ticket_tier_id?: number;
  ticket_tier_name?: string;
  items?: TicketQuoteItem[];
  quantity: number;
  currency: string;
  unit_price_ugx: number;
  unit_price_credits: number;
  base_amount: number;
  discount_amount?: number;
  discounted_base_amount?: number;
  total_credits: number;
  platform_commission_percent: number;
  platform_commission_amount: number;
  processing_fee_percent: number;
  processing_fee_amount: number;
  total_fee_amount: number;
  total_amount: number;
  organizer_net_amount: number;
  fee_source: string;
  organizer_plan?: {
    id: number;
    name: string;
    slug?: string;
    tier?: string;
  } | null;
  discount_code?: {
    id: number;
    code: string;
    name?: string | null;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
  } | null;
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

export interface CreateTicketSupportCaseRequest {
  case_type: 'refund_request' | 'payment_dispute';
  dispute_category?: string;
  reason: string;
  gateway_reference?: string;
  evidence_url?: string;
  evidence_notes?: string;
  requested_refund_amount?: number;
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
  const rawDiscountCodes = raw.discount_codes as EventDiscountCode[] | undefined;
  const rawStaffMembers = raw.staff_members as EventStaffMember[] | undefined;
  const rawRequirements = Array.isArray(raw.requirements) ? raw.requirements as string[] : undefined;
  const rawContactInfo = (raw.contact_info && typeof raw.contact_info === 'object' ? raw.contact_info : undefined) as Event['contact_info'];
  const rawOperations = (raw.operations && typeof raw.operations === 'object' ? raw.operations : undefined) as Event['operations'];
  const rawSocialLinks = (raw.social_links && typeof raw.social_links === 'object' ? raw.social_links : undefined) as Record<string, string> | undefined;
  const rawMarketingSettings = (raw.marketing_settings && typeof raw.marketing_settings === 'object' ? raw.marketing_settings : undefined) as Event['marketing_settings'];
  const rawTicketingSummary = (raw.ticketing_summary && typeof raw.ticketing_summary === 'object' ? raw.ticketing_summary : undefined) as Event['ticketing_summary'];
  const rawPayoutCenter = (raw.payout_center && typeof raw.payout_center === 'object' ? raw.payout_center : undefined) as Event['payout_center'];

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
    ticketing_mode: raw.ticketing_mode as Event['ticketing_mode'],
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
    discount_codes: rawDiscountCodes,
    staff_members: rawStaffMembers,
    waitlist_count: raw.waitlist_count as number | undefined,
    waitlist_joined: raw.waitlist_joined as boolean | undefined,

    // Stats
    tickets_sold: raw.tickets_sold as number | undefined,
    attendee_count: raw.attendee_count as number | undefined,
    rating_average: raw.rating_average as number | null | undefined,
    review_count: raw.review_count as number | undefined,

    // Metadata
    tags,
    registration_deadline: raw.registration_deadline as string | undefined,
    refund_policy: raw.refund_policy as string | undefined,
    cancellation_policy: raw.cancellation_policy as string | undefined,
    requirements: rawRequirements,
    contact_info: rawContactInfo,
    website: raw.website as string | undefined,
    social_links: rawSocialLinks,
    marketing_settings: rawMarketingSettings,
    ticketing_summary: rawTicketingSummary,
    operations: rawOperations,
    payout_center: rawPayoutCenter,
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
  registration_deadline?: string;
  refund_policy?: string;
  cancellation_policy?: string;
  requirements?: string[];
  contact_info?: {
    support_email?: string;
    support_phone?: string;
    invoice_issuer_name?: string;
    invoice_support_email?: string;
    tax_registration_number?: string;
    tax_rate_percent?: number;
    tax_is_inclusive?: boolean;
    age_restriction?: string;
    door_notes?: string;
    tax_vat_notes?: string;
  };
  website?: string;
  social_links?: Record<string, string>;
  marketing_settings?: Event['marketing_settings'];
  is_free?: boolean;
  ticketing_mode?: Event['ticketing_mode'];
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

export function useTicketInvoice(ticketId: number | string, enabled = false) {
  return useQuery({
    queryKey: ["ticket", ticketId, "invoice"],
    queryFn: () => apiGet<{ data: TicketInvoice }>(`/tickets/${ticketId}/invoice`).then((res) => res.data),
    enabled: enabled && !!ticketId,
  });
}

export function useResendTicket(ticketId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<{ message: string; data: Ticket }>(`/tickets/${ticketId}/resend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useTransferTicket(ticketId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      holder_name: string;
      holder_email?: string;
      holder_phone?: string;
      message?: string;
    }) => apiPost<{ message: string; data: Ticket }>(`/tickets/${ticketId}/transfer`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useTicketCases(ticketId: number | string) {
  return useQuery({
    queryKey: ["ticket", ticketId, "cases"],
    queryFn: () => apiGet<{ data: TicketSupportCase[] }>(`/tickets/${ticketId}/cases`).then((res) => res.data || []),
    enabled: !!ticketId,
  });
}

export function useRequestTicketCase(ticketId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketSupportCaseRequest) =>
      apiPost<{ message: string; data: TicketSupportCase }>(`/tickets/${ticketId}/cases`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId, "cases"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useSavedAttendeeProfiles(limit = 10, enabled = true) {
  return useQuery({
    queryKey: ["tickets", "attendee-profiles", limit],
    queryFn: () =>
      apiGet<{ data: SavedAttendeeProfile[] }>("/tickets/attendee-profiles", {
        params: { limit },
      }).then((res) => res.data || []),
    enabled,
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
        } else if (key === 'requirements' || key === 'contact_info' || key === 'social_links') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'marketing_settings') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'location') {
          // 'location' is used as city fallback
          if (!data.city && typeof value === 'string') {
            formData.append('city', value);
          }
        } else if (typeof value === 'boolean') {
          const mappedKey = fieldMap[key] || key;
          formData.append(mappedKey, value ? '1' : '0');
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

      const fieldMap: Record<string, string> = {
        date: 'start_date',
        time: 'start_time',
        venue: 'venue_name',
        capacity: 'attendee_limit',
        image: 'cover_image',
        banner_image: 'cover_image',
      };

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'ticket_tiers') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'requirements' || key === 'contact_info' || key === 'social_links' || key === 'marketing_settings') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'location') {
          if (!data.city && typeof value === 'string') {
            formData.append('city', value);
          }
        } else if (typeof value === 'boolean') {
          formData.append(fieldMap[key] || key, value ? '1' : '0');
        } else if (value instanceof File) {
          formData.append(fieldMap[key] || key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(fieldMap[key] || key, String(value));
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

export function useStoreEventPromotionRequest(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      promotion_slug?: string;
      promotion_title: string;
      promotion_type?: string;
      promotion_platform?: string;
      price_credits?: number;
      price_ugx?: number;
      request_notes?: string;
      featured_image_url?: string | null;
      payload?: Record<string, unknown>;
    }) => apiPost<{ success: boolean; data: EventPromotionRequest; message: string }>(`/artist/events/${eventId}/promotion-requests`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events", String(eventId)] });
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
        confirmed_orders: number;
        gross_revenue: number;
        customer_paid_total: number;
        revenue: number;
        revenue_credits: number;
        tesotunes_fee_revenue: number;
        platform_commission_revenue: number;
        processing_fee_revenue: number;
        estimated_organizer_payout: number;
        average_order_value: number;
        fee_contract_coverage: {
          orders_with_fee_breakdown: number;
          legacy_orders_without_fee_breakdown: number;
        };
        payouts: {
          held_balance: number;
          pending_balance: number;
          ready_balance: number;
          settled_balance: number;
          failed_balance: number;
          entry_count: number;
          status_breakdown: {
            pending: number;
            ready: number;
            paid: number;
            failed: number;
            held: number;
          };
          latest_ready_at?: string | null;
          latest_paid_out_at?: string | null;
          latest_held_at?: string | null;
        };
        marketing: {
          attributed_orders: number;
          unattributed_orders: number;
          attributed_revenue: number;
          top_sources: Array<{
            source: string;
            channel?: string | null;
            campaign_code?: string | null;
            referral_code?: string | null;
            orders: number;
            tickets_sold: number;
            gross_revenue: number;
            customer_paid_total: number;
            estimated_organizer_payout: number;
            tesotunes_fee_revenue: number;
          }>;
        };
        funnel: {
          totals: {
            visits: number;
            checkout_starts: number;
            paid_orders: number;
            tickets_sold: number;
          };
          by_source: Array<{
            label: string;
            channel?: string | null;
            campaign_code?: string | null;
            referral_code?: string | null;
            visits: number;
            checkout_starts: number;
            paid_orders: number;
            tickets_sold: number;
            visit_to_checkout_rate: number;
            checkout_to_order_rate: number;
            visit_to_order_rate: number;
          }>;
        };
        sales_channels: {
          channels: Array<{
            key: 'tesotunes_native' | 'tracked_promo' | 'manual_offline' | 'external';
            label: string;
            orders: number;
            tickets_sold: number;
            gross_revenue: number;
            customer_paid_total: number;
            estimated_organizer_payout: number;
            tesotunes_fee_revenue: number;
            order_share_percent: number;
          }>;
        };
        roi: {
          total_spend: number;
          total_gross_revenue: number;
          total_organizer_payout: number;
          total_net_profit: number;
          tracked_sources: number;
          by_source: Array<{
            key: string;
            label: string;
            channel?: string | null;
            campaign_code?: string | null;
            referral_code?: string | null;
            orders: number;
            tickets_sold: number;
            spend: number;
            gross_revenue: number;
            customer_paid_total: number;
            estimated_organizer_payout: number;
            tesotunes_fee_revenue: number;
            net_profit: number;
            roas: number | null;
            payout_roi_percent: number | null;
            notes?: string | null;
          }>;
        };
        settlements: {
          event_totals: {
            gross_revenue: number;
            organizer_net_amount: number;
            settled_balance: number;
            failed_balance: number;
          };
          by_tier: Array<{
            tier: string;
            sold: number;
            gross_revenue: number;
            organizer_net_amount: number;
            tesotunes_fee_revenue: number;
          }>;
          by_campaign: Array<{
            label: string;
            channel?: string | null;
            campaign_code?: string | null;
            referral_code?: string | null;
            orders: number;
            tickets_sold: number;
            gross_revenue: number;
            customer_paid_total: number;
            tesotunes_fee_revenue: number;
            organizer_net_amount: number;
          }>;
          by_payout_cycle: Array<{
            cycle_date?: string | null;
            entry_count: number;
            gross_revenue: number;
            customer_paid_total: number;
            tesotunes_fee_revenue: number;
            organizer_net_amount: number;
            dominant_status: string;
          }>;
        };
        support_cases: {
          open: number;
          approved: number;
          rejected: number;
          refund_requests: number;
          payment_disputes: number;
          open_payment_disputes: number;
          chargeback_review_cases: number;
          chargeback_exposure_amount: number;
          approved_refund_amount: number;
        };
        audit_log: {
          total_entries: number;
          recent_entries: Array<{
            id: number;
            action: string;
            actor?: string | null;
            created_at?: string | null;
            old_values?: Record<string, unknown>;
            new_values?: Record<string, unknown>;
          }>;
        };
        health: {
          score: number;
          grade: 'strong' | 'watch' | 'at_risk';
          issues: Array<{
            key: string;
            severity: 'low' | 'medium' | 'high';
            label: string;
            detail: string;
          }>;
          summary: {
            conversion_rate: number;
            sell_through_rate: number;
            held_balance: number;
            legacy_orders_without_fee_breakdown: number;
          };
        };
        check_ins: number;
        interested_count: number;
        total_attendees: number;
        conversion_rate: number;
        sell_through_rate: number;
        by_tier: Array<{
          id: number;
          name: string;
          sold: number;
          total: number | null;
          revenue: number;
          estimated_organizer_payout: number;
          tesotunes_fee_revenue: number;
          available: number;
        }>;
        by_date: Array<{
          date: string;
          revenue: number;
          tickets_sold: number;
          customer_paid_total: number;
          estimated_organizer_payout: number;
          tesotunes_fee_revenue: number;
        }>;
      };
    }>(`/artist/events/${eventId}/analytics`),
    enabled: !!eventId,
  });
}

export function useEventTicketCases(eventId: number | string) {
  return useQuery({
    queryKey: ["artist", "events", eventId, "ticket-cases"],
    queryFn: () => apiGet<{ data: TicketSupportCase[] }>(`/artist/events/${eventId}/ticket-cases`).then((res) => res.data || []),
    enabled: !!eventId,
  });
}

export function useResolveEventTicketCase(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      caseId,
      decision,
      resolution_notes,
      approved_refund_amount,
    }: {
      caseId: number;
      decision: 'approve' | 'reject';
      resolution_notes?: string;
      approved_refund_amount?: number;
    }) => apiPost<{ message: string; data: TicketSupportCase }>(`/artist/events/${eventId}/ticket-cases/${caseId}/resolve`, {
      decision,
      resolution_notes,
      approved_refund_amount,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "ticket-cases"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId] });
    },
  });
}

export function useEventOfflineSales(eventId: number | string) {
  return useQuery({
    queryKey: ["artist", "events", eventId, "offline-sales"],
    queryFn: () => apiGet<{ data: OfflineSaleOrder[] }>(`/artist/events/${eventId}/offline-sales`).then((res) => res.data || []),
    enabled: !!eventId,
  });
}

export function useStoreOfflineSale(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      ticket_tier_id: number;
      quantity: number;
      holder_name?: string;
      holder_email?: string;
      holder_phone?: string;
      unit_price_ugx?: number;
      sale_source?: 'printed_ticket' | 'door_sale' | 'phone_booking' | 'complimentary';
      notes?: string;
    }) => apiPost<{ message: string; data: OfflineSaleOrder }>(`/artist/events/${eventId}/offline-sales`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "offline-sales"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId] });
    },
  });
}

export function useStorePrintedTicketImport(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      ticket_tier_id: number;
      codes: string | string[];
      holder_name?: string;
      holder_email?: string;
      holder_phone?: string;
      unit_price_ugx?: number;
      notes?: string;
      validation_notes?: string;
    }) => apiPost<{ message: string; data: OfflineSaleOrder }>(`/artist/events/${eventId}/printed-ticket-imports`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "offline-sales"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId] });
    },
  });
}

export function useSyncPrintedTicketImport(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      order_id: string;
      holder_name?: string;
      holder_email?: string;
      holder_phone?: string;
      notes?: string;
      validation_notes?: string;
    }) => apiPost<{ message: string; data: OfflineSaleOrder }>(`/artist/events/${eventId}/printed-ticket-imports/${data.order_id}/sync`, {
      holder_name: data.holder_name,
      holder_email: data.holder_email,
      holder_phone: data.holder_phone,
      notes: data.notes,
      validation_notes: data.validation_notes,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "offline-sales"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId] });
    },
  });
}

export function useVoidOfflineSale(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      apiPost<{ message: string }>(`/artist/events/${eventId}/offline-sales/${orderId}/void`, {
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "offline-sales"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId] });
    },
  });
}

export function useEventExternalAllocations(eventId: number | string) {
  return useQuery({
    queryKey: ["artist", "events", eventId, "external-allocations"],
    queryFn: () => apiGet<{ data: ExternalAllocation[] }>(`/artist/events/${eventId}/external-allocations`).then((res) => res.data || []),
    enabled: !!eventId,
  });
}

export function useStoreExternalAllocation(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      ticket_tier_id: number;
      quantity: number;
      channel_label: string;
      notes?: string;
    }) => apiPost<{ message: string; data: ExternalAllocation }>(`/artist/events/${eventId}/external-allocations`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "external-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId] });
    },
  });
}

export function useReleaseExternalAllocation(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ allocationId, reason }: { allocationId: number; reason?: string }) =>
      apiPost<{ message: string; data: ExternalAllocation }>(`/artist/events/${eventId}/external-allocations/${allocationId}/release`, {
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "external-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId, "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "events", eventId] });
    },
  });
}

export function useTrackEventFunnel(eventId: number | string) {
  return useMutation({
    mutationFn: (payload: TrackEventFunnelRequest) =>
      apiPost(`/events/${eventId}/funnel-touch`, payload),
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

export function useJoinEventWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { eventId: number; email?: string; phone?: string }) =>
      apiPost<{ message: string; data: { event_id: number; waitlist_count: number; waitlist_joined: boolean } }>(`/events/${data.eventId}/waitlist`, {
        email: data.email,
        phone: data.phone,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
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
      discount_code?: string;
      attribution?: PurchaseTicketRequest['attribution'];
    }) => {
      const quoteResponse = await apiPost<{ data: TicketQuote }>("/tickets/quote", {
        event_id: data.event_id,
        tickets: data.tickets,
        discount_code: data.discount_code,
      });
      const quote = quoteResponse.data;

      return {
        checkout_id: `checkout_${Date.now()}`,
        total_ugx: quote.total_amount,
        total_credits: quote.total_credits,
        platform_fee: quote.total_fee_amount,
        discount_amount: quote.discount_amount ?? 0,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        quote,
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
      discount_code?: string;
      tickets: Array<{
        ticket_tier_id: number;
        quantity: number;
      }>;
      holder_name?: string;
      holder_email?: string;
      holder_phone?: string;
      attendee_assignments?: PurchaseTicketRequest['attendee_assignments'];
      attribution?: PurchaseTicketRequest['attribution'];
    }) => {
      const purchaseData: PurchaseTicketRequest = {
        event_id: data.event_id,
        tickets: data.tickets,
        payment_method: data.payment_provider as PurchaseTicketRequest['payment_method'],
        phone: data.phone_number,
        discount_code: data.discount_code,
        holder_name: data.holder_name,
        holder_email: data.holder_email,
        holder_phone: data.holder_phone,
        attendee_assignments: data.attendee_assignments,
        attribution: data.attribution,
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
    mutationFn: async (data: {
      event_id: number;
      code: string;
      tickets: Array<{ ticket_tier_id: number; quantity: number }>;
    }) =>
      apiPost<{
        valid: boolean;
        message: string;
        data: {
          code: string;
          discount_amount: number;
          quote: TicketQuote;
        };
      }>("/tickets/discounts/validate", {
        event_id: data.event_id,
        tickets: data.tickets,
        code: data.code,
      }),
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
