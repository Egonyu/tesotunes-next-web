// ============================================================================
// TesoTunes Promotions Module - Type Definitions
// Promotion Campaigns Marketplace (distinct from Store coupon/discount promos)
// ============================================================================

// ---------------------------------------------------------------------------
// Enums / Literal Unions
// ---------------------------------------------------------------------------

export type PromotionType =
  | "social_media_mention"
  | "live_stream_promotion"
  | "radio_mention"
  | "dj_shoutout"
  | "ticket_giveaway"
  | "content_creation"
  | "playlist_inclusion"
  | "collaboration_offer";

export type PromotionPlatform =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "twitter"
  | "spotify"
  | "apple_music"
  | "radio"
  | "club"
  | "event"
  | "blog"
  | "podcast"
  | "other";

export type PromotionStatus =
  | "draft"
  | "pending"
  | "active"
  | "paused"
  | "rejected"
  | "archived"
  | "expired";

export type OrderStatus =
  | "pending_verification"
  | "verification_submitted"
  | "completed"
  | "disputed"
  | "refunded"
  | "cancelled";

export type PaymentMethod = "credits" | "ugx" | "hybrid";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export type DisputeResolution = "refund_buyer" | "release_to_seller";

// ---------------------------------------------------------------------------
// Core Models
// ---------------------------------------------------------------------------

export interface PromoterSummary {
  id: number;
  name: string;
  username: string;
  avatar_url: string | null;
  is_verified: boolean;
  follower_count: number;
}

export interface PromotionRequirements {
  action: string;
  duration_hours?: number;
  hashtags?: string[];
}

/** Lightweight promotion card used in list / browse views */
export interface PromotionListItem {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  type: PromotionType;
  platform: PromotionPlatform;
  price_credits: number;
  price_ugx: number;
  accepts_credits: boolean;
  accepts_ugx: boolean;
  accepts_hybrid: boolean;
  estimated_reach: number;
  delivery_days_min: number;
  delivery_days_max: number;
  rating_average: number;
  rating_count: number;
  total_orders: number;
  completed_orders: number;
  is_featured: boolean;
  is_top_rated: boolean;
  promoter: PromoterSummary;
  featured_image_url: string | null;
  status: PromotionStatus;
  created_at: string;
}

/** Full promotion detail (extends list item with extra fields) */
export interface Promotion extends PromotionListItem {
  description: string;
  requirements: PromotionRequirements | null;
  deliverables: string[];
  terms: string | null;
  reviews?: PromotionReview[];
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface OrderVerification {
  status: "pending" | "submitted" | "verified" | "rejected";
  submitted_at: string | null;
  verified_at: string | null;
  verification_url: string | null;
  verification_notes: string | null;
  verification_files: string[];
  rejection_reason: string | null;
}

export interface OrderDispute {
  is_disputed: boolean;
  dispute_reason: string | null;
  reason?: string | null;
  disputed_at: string | null;
  created_at?: string | null;
  resolved_at: string | null;
  resolution: DisputeResolution | null;
  resolution_notes: string | null;
  admin_notes?: string | null;
  evidence_url?: string | null;
}

export interface PromotionOrder {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  credit_amount: number;
  ugx_amount: number;
  total_credits: number;
  total_ugx: number;
  promotion: PromotionListItem;
  song: OrderSong | null;
  buyer: PromoterSummary;
  notes: string | null;
  verification: OrderVerification;
  dispute: OrderDispute;
  created_at: string;
  expected_delivery_at: string;
  completed_at: string | null;
}

export interface OrderSong {
  id: number;
  title: string;
  slug: string;
  artwork_url: string | null;
  audio_url: string | null;
  artist: { id: number; name: string; slug: string };
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface PromotionReview {
  id: number;
  promotion_id: number;
  order_id: number;
  rating: number;
  comment: string;
  would_recommend: boolean;
  helpful_count: number;
  reviewer: PromoterSummary;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface SellerAnalytics {
  total_promotions: number;
  active_promotions: number;
  total_orders: number;
  completed_orders: number;
  pending_verifications: number;
  total_revenue_credits: number;
  total_revenue_ugx: number;
  average_rating: number;
  conversion_rate: number;
  top_performing_promotion: PromotionListItem | null;
}

export interface AdminAnalytics {
  total_promotions: number;
  active_promotions: number;
  total_orders: number;
  total_gmv_credits: number;
  total_gmv_ugx: number;
  platform_revenue_ugx: number;
  top_promoters: PromoterSummary[];
  top_promotion_types: { type: PromotionType; count: number; revenue: number }[];
  average_order_value: number;
  dispute_rate: number;
}

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

export interface BrowsePromotionsParams {
  type?: PromotionType;
  platform?: PromotionPlatform;
  min_reach?: number;
  max_reach?: number;
  min_price_credits?: number;
  max_price_credits?: number;
  min_price_ugx?: number;
  max_price_ugx?: number;
  rating_min?: number;
  sort?: "price_asc" | "price_desc" | "rating" | "popularity" | "newest";
  featured?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PurchasePromotionRequest {
  payment_method: PaymentMethod;
  credits_amount?: number;
  ugx_amount?: number;
  song_id?: number;
  notes?: string;
  preferred_delivery_date?: string;
}

export interface SubmitVerificationRequest {
  verification_url: string;
  verification_notes?: string;
  verification_files?: string[];
}

export interface CreatePromotionRequest {
  title: string;
  short_description: string;
  description: string;
  type: PromotionType;
  platform: PromotionPlatform;
  price_credits: number;
  price_ugx: number;
  accepts_credits: boolean;
  accepts_ugx: boolean;
  accepts_hybrid: boolean;
  estimated_reach: number;
  delivery_days_min: number;
  delivery_days_max: number;
  requirements?: PromotionRequirements;
  deliverables?: string[];
  terms?: string;
  featured_image?: string;
}

export type UpdatePromotionRequest = Partial<CreatePromotionRequest>;

export interface DisputeOrderRequest {
  reason: string;
}

export interface ReviewPromotionRequest {
  rating: number;
  comment: string;
  would_recommend: boolean;
}

export interface VerifyOrderRequest {
  verified: boolean;
  notes?: string;
}

export interface RejectOrderRequest {
  reason: string;
}

export interface ResolveDisputeRequest {
  resolution: DisputeResolution;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Response Wrappers
// ---------------------------------------------------------------------------

export interface PaginatedPromotions {
  data: PromotionListItem[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface PaginatedOrders {
  data: PromotionOrder[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface PaginatedReviews {
  data: PromotionReview[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface PurchaseResponse {
  order_id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_credits: number;
  total_ugx: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// UI Helpers / Display Maps
// ---------------------------------------------------------------------------

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  social_media_mention: "Social Media Mention",
  live_stream_promotion: "Live Stream Promotion",
  radio_mention: "Radio Airplay",
  dj_shoutout: "DJ Shoutout",
  ticket_giveaway: "Event Tickets",
  content_creation: "Content Creation",
  playlist_inclusion: "Playlist Inclusion",
  collaboration_offer: "Collaboration Offer",
};

export const PROMOTION_PLATFORM_LABELS: Record<PromotionPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  twitter: "Twitter / X",
  spotify: "Spotify",
  apple_music: "Apple Music",
  radio: "Radio",
  club: "Club / Venue",
  event: "Event",
  blog: "Blog",
  podcast: "Podcast",
  other: "Other",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_verification: "Pending Verification",
  verification_submitted: "Verification Submitted",
  completed: "Completed",
  disputed: "Disputed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  draft: "Draft",
  pending: "Pending Approval",
  active: "Active",
  paused: "Paused",
  rejected: "Rejected",
  archived: "Archived",
  expired: "Expired",
};
