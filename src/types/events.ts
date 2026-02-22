// ============================================================================
// Events System - Enhanced Types
// ============================================================================

import type { Artist, Genre, User } from './index'

// ============================================================================
// Core Event Types
// ============================================================================

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed' | 'postponed' | 'sold_out'
export type EventCategory = 'concert' | 'festival' | 'party' | 'workshop' | 'conference' | 'meetup' | 'exhibition' | 'sports' | 'comedy' | 'theater' | 'other'
export type TicketStatus = 'valid' | 'used' | 'cancelled' | 'expired' | 'transferred' | 'refunded'
export type GroupBookingStatus = 'draft' | 'active' | 'confirmed' | 'cancelled' | 'expired'
export type GroupMemberStatus = 'invited' | 'confirmed' | 'paid' | 'declined'
export type PaymentMethod = 'ugx' | 'credits' | 'hybrid' | 'mtn_momo' | 'airtel_money' | 'card'
export type PaymentSplitType = 'equal' | 'custom' | 'organizer_pays'
export type CheckoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'refunded'
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type AffiliateTier = 'bronze' | 'silver' | 'gold' | 'platinum'

// ============================================================================
// Event
// ============================================================================

export interface EventLocation {
  venue_name: string
  venue_address: string
  city: string
  country: string
  latitude?: number
  longitude?: number
  map_url?: string
}

export interface EventOrganizer {
  id: number
  name: string
  slug?: string
  avatar_url?: string
  is_verified?: boolean
  events_count?: number
  total_attendees?: number
}

export interface EventTicketTier {
  id: number
  event_id: number
  name: string
  description: string
  price: number
  price_ugx: number
  price_credits?: number
  is_free: boolean
  quantity_total: number
  quantity_sold: number
  available: number
  max_per_order: number
  sales_start_date?: string
  sales_end_date?: string
  is_active: boolean
  required_loyalty_tier?: LoyaltyTier
  tier_early_access_hours?: number
  perks?: string[]
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface EventSocialProof {
  friends_attending: EventAttendeePreview[]
  total_attending: number
  hype_score: number
  recent_activity: EventActivity[]
  interested_count: number
  bookmarked_count: number
  share_count: number
}

export interface EventAttendeePreview {
  id: number
  name: string
  avatar_url?: string
}

export interface EventActivity {
  id: number
  user: EventAttendeePreview
  action: 'purchased' | 'interested' | 'shared' | 'checked_in' | 'reviewed'
  tier_name?: string
  timestamp: string
}

export interface EventLiveData {
  tickets_remaining: number
  tickets_sold_today: number
  last_purchase_at?: string
  price_trending: 'up' | 'down' | 'stable'
  current_attendees: number
  is_selling_fast: boolean
}

export interface Event {
  id: number
  uuid: string
  title: string
  slug: string
  description: string
  short_description?: string
  image_url: string
  artwork_url?: string
  banner_url?: string
  video_preview_url?: string
  category: EventCategory
  event_type?: string
  tags?: string[]

  // Dates
  starts_at: string
  ends_at?: string
  doors_open_at?: string
  timezone: string
  registration_deadline?: string

  // Location
  location: EventLocation
  is_virtual: boolean
  virtual_link?: string

  // Capacity & Sales
  capacity: number
  attendee_count: number
  tickets_sold: number
  is_free: boolean
  cheapest_ticket_price?: number
  currency: string

  // Status
  status: EventStatus
  is_featured: boolean
  is_published: boolean
  published_at?: string

  // Relations
  organizer: EventOrganizer
  artists: Artist[]
  ticket_tiers: EventTicketTier[]
  genres?: Genre[]

  // Engagement
  hype_score: number
  rating_average?: number
  review_count?: number

  // Social
  social_proof?: EventSocialProof
  live_data?: EventLiveData
  user_data?: EventUserData

  // Pricing
  dynamic_pricing_enabled?: boolean
  early_bird_active?: boolean
  flash_sale_active?: boolean

  // Timestamps
  created_at: string
  updated_at: string

  // Links
  links?: {
    self: string
    tickets: string
    organizer: string
  }
}

export interface EventUserData {
  is_interested: boolean
  is_bookmarked: boolean
  has_ticket: boolean
  ticket_tier?: string
  friends_attending: EventAttendeePreview[]
  can_review: boolean
}

// ============================================================================
// Event Feed Types
// ============================================================================

export interface EventFeedCard {
  event: Event
  socialProof: EventSocialProof
  interactions: {
    interested: boolean
    bookmarked: boolean
    shared: number
  }
  liveData: EventLiveData
}

export interface EventFilters {
  search?: string
  category?: EventCategory
  city?: string
  date_from?: string
  date_to?: string
  price_min?: number
  price_max?: number
  is_free?: boolean
  is_virtual?: boolean
  sort?: 'date_asc' | 'date_desc' | 'trending' | 'popular' | 'price_asc' | 'price_desc'
  friends_attending?: boolean
  has_tickets?: boolean
}

// ============================================================================
// Ticket Types
// ============================================================================

export interface Ticket {
  id: number
  event_id: number
  event: Event
  ticket_tier_id: number
  ticket_tier: EventTicketTier
  order_id: number
  ticket_number: string
  qr_code: string
  qr_code_url?: string
  status: TicketStatus
  holder_name: string
  holder_email: string
  holder_phone?: string
  seat_number?: string
  is_transferable: boolean
  is_resellable: boolean
  max_resale_price?: number
  checked_in_at?: string
  checked_in_by?: number
  transfer_history?: TicketTransfer[]
  created_at: string
  updated_at: string
}

export interface TicketTransfer {
  id: number
  from_user: EventAttendeePreview
  to_user: EventAttendeePreview
  transferred_at: string
  price?: number
}

export interface TicketsResponse {
  data: Ticket[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// ============================================================================
// Checkout Types
// ============================================================================

export interface CartItem {
  ticket_tier_id: number
  ticket_tier: EventTicketTier
  quantity: number
  unit_price: number
  subtotal: number
}

export interface CheckoutSession {
  id: string
  event_id: number
  event: Event
  items: CartItem[]
  subtotal: number
  platform_fee: number
  discount_amount: number
  total_ugx: number
  total_credits: number
  payment_method: PaymentMethod
  discount_code?: string
  expires_at: string
  status: CheckoutStatus
  payment_breakdown?: {
    ugx_amount: number
    credits_amount: number
    bonus_credits: number
  }
}

export interface CheckoutInitiateRequest {
  tickets: Array<{
    ticket_tier_id: number
    quantity: number
  }>
  payment_method: PaymentMethod
  discount_code?: string
  credits_to_use?: number
}

export interface CheckoutInitiateResponse {
  checkout_id: string
  total_ugx: number
  total_credits: number
  platform_fee: number
  discount_amount: number
  expires_at: string
  payment_methods: AvailablePaymentMethods
}

export interface CheckoutCompleteRequest {
  checkout_id: string
  payment_provider: string
  payment_details: Record<string, unknown>
  phone_number?: string
}

export interface CheckoutCompleteResponse {
  order_id: string
  tickets: Ticket[]
  credits_earned: number
  total_paid: {
    ugx: number
    credits: number
  }
  message: string
}

export interface AvailablePaymentMethods {
  ugx: {
    enabled: boolean
    providers: string[]
  }
  credits: {
    enabled: boolean
    balance: number
  }
  hybrid: {
    enabled: boolean
    max_credits: number
    bonus_percent: number
  }
}

export interface DiscountCode {
  code: string
  discount_percent?: number
  discount_amount?: number
  valid: boolean
  message: string
  max_uses?: number
  uses_count?: number
}

// ============================================================================
// Group Booking Types
// ============================================================================

export interface GroupBooking {
  id: string
  event_id: number
  event: Event
  organizer: User
  members: GroupMember[]
  status: GroupBookingStatus
  ticket_tier_id: number
  ticket_tier: EventTicketTier
  total_seats: number
  seats_booked: number
  deadline: string
  payment_split: PaymentSplitType
  discount_percent: number
  total_amount: number
  per_person_amount: number
  invite_link: string
  invite_code: string
  group_chat_enabled: boolean
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: number
  user: EventAttendeePreview
  status: GroupMemberStatus
  amount_owed: number
  amount_paid: number
  payment_method?: PaymentMethod
  paid_at?: string
  invited_at: string
}

export interface CreateGroupBookingRequest {
  event_id: number
  ticket_tier_id: number
  total_seats: number
  payment_split: PaymentSplitType
  deadline?: string
}

export interface GroupInviteRequest {
  user_ids?: number[]
  emails?: string[]
  phone_numbers?: string[]
}

// ============================================================================
// Dynamic Pricing Types
// ============================================================================

export interface DynamicPricingInfo {
  base_price: number
  current_price: number
  demand_multiplier: number
  time_multiplier: number
  user_discount?: number
  volume_discounts: VolumeDiscount[]
  flash_sale?: FlashSale
  price_history: PricePoint[]
}

export interface VolumeDiscount {
  min_quantity: number
  discount_percent: number
  label: string
}

export interface FlashSale {
  id: number
  starts_at: string
  ends_at: string
  discount_percent: number
  max_tickets: number
  tickets_sold: number
  is_active: boolean
}

export interface PricePoint {
  price: number
  timestamp: string
}

// ============================================================================
// Event Credit Economy
// ============================================================================

export interface EventCreditRewards {
  early_bird_bonus: number
  referral_reward: number
  check_in_bonus: number
  review_reward: number
  ugc_bonus: number
  group_organizer_cashback_percent: number
}

export interface HybridPaymentCalculation {
  total_amount: number
  ugx_amount: number
  credits_amount: number
  bonus_credits: number
  savings_percent: number
  max_credits_allowed: number
  min_credits_required: number
}

// ============================================================================
// Gamification Types
// ============================================================================

export interface EventAchievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'attendance' | 'social' | 'spending' | 'streak'
  progress: number
  target: number
  unlocked: boolean
  unlocked_at?: string
  reward_credits?: number
}

export interface EventStreak {
  current: number
  longest: number
  bonus_multiplier: number
  next_milestone: number
  next_milestone_reward: number
}

export interface EventLeaderboard {
  period: 'weekly' | 'monthly' | 'all_time'
  entries: LeaderboardEntry[]
  user_rank?: number
}

export interface LeaderboardEntry {
  rank: number
  user: EventAttendeePreview
  score: number
  badge?: string
}

export interface EventChallenge {
  id: string
  title: string
  description: string
  type: 'weekly' | 'monthly' | 'seasonal'
  progress: number
  target: number
  reward_credits: number
  reward_badge?: string
  starts_at: string
  ends_at: string
  completed: boolean
}

// ============================================================================
// Affiliate Types
// ============================================================================

export interface EventAffiliate {
  id: number
  user: EventAttendeePreview
  unique_code: string
  unique_link: string
  qr_code_url?: string
  stats: AffiliateStats
  tier: AffiliateTier
  commission_percent: number
  total_earned: number
  pending_payout: number
}

export interface AffiliateStats {
  clicks: number
  conversions: number
  conversion_rate: number
  revenue_generated: number
  commission_earned: number
}

export interface CreateAffiliateRequest {
  event_id: number
  commission_percent?: number
}

// ============================================================================
// Live Event Types
// ============================================================================

export interface LiveEventState {
  is_live: boolean
  attendee_count: number
  check_in_count: number
  photo_count: number
  chat_enabled: boolean
}

export interface LiveCheckInRequest {
  event_id: number
  latitude?: number
  longitude?: number
}

export interface LiveCheckInResponse {
  success: boolean
  credits_earned: number
  achievement_unlocked?: EventAchievement
  message: string
}

export interface LivePhoto {
  id: number
  user: EventAttendeePreview
  image_url: string
  thumbnail_url: string
  caption?: string
  likes: number
  created_at: string
}

export interface LiveChatMessage {
  id: number
  user: EventAttendeePreview
  message: string
  type: 'text' | 'photo' | 'system'
  created_at: string
}

// ============================================================================
// Organizer Analytics Types
// ============================================================================

export interface OrganizerAnalytics {
  total_revenue: number
  net_earnings: number
  platform_fee_total: number
  tickets_sold: number
  total_attendees: number
  check_in_rate: number
  average_ticket_price: number
  conversion_rate: number

  revenue_breakdown: {
    ticket_sales: number
    credits_redeemed: number
    affiliate_commissions: number
    refunds: number
  }

  sales_velocity: Array<{
    date: string
    tickets_sold: number
    revenue: number
  }>

  tier_breakdown: Array<{
    tier_name: string
    sold: number
    total: number
    revenue: number
    percent_sold: number
  }>

  audience_insights: {
    demographics: {
      cities: Array<{ city: string; count: number; percent: number }>
      loyalty_tiers: Record<LoyaltyTier, number>
    }
    repeat_attendees: number
    new_attendees: number
    average_group_size: number
  }

  marketing: {
    referral_sales: number
    social_shares: number
    affiliate_sales: number
    top_affiliates: Array<{
      user: EventAttendeePreview
      sales: number
      revenue: number
    }>
  }
}

// ============================================================================
// Event Recommendations
// ============================================================================

export interface EventRecommendations {
  for_you: Event[]
  trending: Event[]
  friends_attending: Event[]
  based_on_history: Event[]
  last_chance: Event[]
  new_and_noteworthy: Event[]
}

// ============================================================================
// Create/Update Event (Organizer)
// ============================================================================

export interface CreateEventRequest {
  title: string
  description: string
  short_description?: string
  category: EventCategory
  event_type?: string
  tags?: string[]
  starts_at: string
  ends_at?: string
  doors_open_at?: string
  timezone?: string
  registration_deadline?: string
  venue_name: string
  venue_address: string
  city: string
  country: string
  is_virtual?: boolean
  virtual_link?: string
  capacity?: number
  image?: File
  banner_image?: File
  video_preview?: File
  ticket_tiers: Array<{
    name: string
    description: string
    price: number
    quantity: number
    max_per_order: number
    is_free?: boolean
    sales_start_date?: string
    sales_end_date?: string
    perks?: string[]
    required_loyalty_tier?: LoyaltyTier
  }>
  dynamic_pricing_enabled?: boolean
  early_bird_enabled?: boolean
  early_bird_discount_percent?: number
  early_bird_quantity?: number
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: number
}

// ============================================================================
// Event Review
// ============================================================================

export interface EventReview {
  id: number
  user: EventAttendeePreview
  event_id: number
  rating: number
  comment: string
  photos?: string[]
  helpful_count: number
  created_at: string
}

export interface CreateReviewRequest {
  event_id: number
  rating: number
  comment: string
  photos?: File[]
}

// ============================================================================
// Events Response
// ============================================================================

export interface EventsResponse {
  data: Event[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface EventsPageResponse {
  pages: Array<{
    events: Event[]
    nextPage: number | undefined
  }>
}
