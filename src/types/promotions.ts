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

export type PromotionAudienceNiche =
  | "afrobeats"
  | "gospel"
  | "hip_hop"
  | "amapiano"
  | "dancehall"
  | "gen_z"
  | "campus"
  | "nightlife"
  | "mainstream"
  | "diaspora";

export type PromotionContentFormat =
  | "short_video"
  | "live_stream"
  | "story_post"
  | "feed_post"
  | "radio_spin"
  | "dj_drop"
  | "playlist_push"
  | "interview_feature";

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

export type DisputeReasonCode =
  | "missing_delivery"
  | "wrong_platform"
  | "poor_quality_proof"
  | "late_delivery"
  | "scope_mismatch"
  | "fraud_or_spam"
  | "other";

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

export interface PromoterProfile {
  id: number;
  name: string;
  username: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  location: string | null;
  is_verified: boolean;
  follower_count: number;
  total_promotions: number;
  active_promotions: number;
  featured_promotions: number;
  average_rating: number;
  completed_orders: number;
  platforms: PromotionPlatform[];
  service_types: PromotionType[];
  audience_summary?: string | null;
  response_time_hours?: number | null;
  proof_points?: string[];
  campaign_highlights?: string[];
  portfolio_items?: PromoterPortfolioItem[];
  social_links: {
    instagram_url?: string | null;
    twitter_url?: string | null;
    facebook_url?: string | null;
    youtube_url?: string | null;
    tiktok_url?: string | null;
    website_url?: string | null;
  };
  promotions: PromotionListItem[];
}

export interface PromoterPortfolioItem {
  title: string;
  summary?: string | null;
  outcome?: string | null;
  platform?: PromotionPlatform | null;
  asset_url?: string | null;
  external_url?: string | null;
}

export interface UpdatePromoterProfileRequest {
  banner_url?: string | null;
  bio?: string | null;
  location?: string | null;
  audience_summary?: string | null;
  response_time_hours?: number | null;
  proof_points?: string[];
  campaign_highlights?: string[];
  portfolio_items?: PromoterPortfolioItem[];
  social_links?: {
    instagram_url?: string | null;
    twitter_url?: string | null;
    facebook_url?: string | null;
    youtube_url?: string | null;
    tiktok_url?: string | null;
    website_url?: string | null;
  };
}

export interface PromotionRequirements {
  action: string;
  duration_hours?: number;
  hashtags?: string[];
}

export interface PromotionPlatformSpecifics {
  channel?: string;
  placement?: string;
  proof?: string;
  timing?: string;
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
  audience_niches?: PromotionAudienceNiche[];
  audience_regions?: string[];
  content_formats?: PromotionContentFormat[];
  delivery_days_min: number;
  delivery_days_max: number;
  platform_specifics?: PromotionPlatformSpecifics;
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
  platform_specifics?: PromotionPlatformSpecifics;
  deliverables: string[];
  terms: string | null;
  featured_image?: string | null;
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
  state?: "open" | "resolved";
  reason_code?: DisputeReasonCode | null;
  dispute_reason: string | null;
  reason?: string | null;
  disputed_at: string | null;
  created_at?: string | null;
  resolved_at: string | null;
  resolution: DisputeResolution | null;
  resolution_notes: string | null;
  admin_notes?: string | null;
  evidence_url?: string | null;
  evidence_files?: string[];
  settlement_status?: string | null;
  refund_reason?: string | null;
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
  total_platform_fees_credits: number;
  total_platform_fees_ugx: number;
  net_revenue_credits: number;
  net_revenue_ugx: number;
  settled_orders: number;
  average_rating: number;
  conversion_rate: number;
  top_performing_promotion: PromotionListItem | null;
}

export interface AdminAnalytics {
  total_promotions: number;
  active_promotions: number;
  pending_promotions?: number;
  total_orders: number;
  total_gmv_credits: number;
  total_gmv_ugx: number;
  platform_revenue_ugx: number;
  top_promoters: PromoterSummary[];
  top_promotion_types: { type: PromotionType; count: number; revenue: number }[];
  platform_breakdown?: {
    platform: PromotionPlatform;
    count: number;
    orders: number;
    completed_orders: number;
  }[];
  dispute_platform_breakdown?: {
    platform: PromotionPlatform;
    count: number;
  }[];
  proof_coverage_pct?: number;
  targeting_coverage_pct?: number;
  refund_rate?: number;
  repeat_buyer_rate?: number;
  avg_proof_submission_hours?: number | null;
  avg_dispute_resolution_hours?: number | null;
  average_order_value: number;
  dispute_rate: number;
}

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

export interface BrowsePromotionsParams {
  type?: PromotionType;
  platform?: PromotionPlatform;
  audience_niche?: PromotionAudienceNiche;
  audience_region?: string;
  content_format?: PromotionContentFormat;
  channel?: string;
  placement?: string;
  proof_type?: string;
  timing?: string;
  min_reach?: number;
  max_reach?: number;
  min_price_credits?: number;
  max_price_credits?: number;
  min_price_ugx?: number;
  max_price_ugx?: number;
  rating_min?: number;
  delivery_days_max?: number;
  verified?: boolean;
  sort?:
    | "best_match"
    | "price_asc"
    | "price_desc"
    | "rating"
    | "popularity"
    | "newest";
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
  event_id?: number;
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
  audience_niches?: PromotionAudienceNiche[];
  audience_regions?: string[];
  content_formats?: PromotionContentFormat[];
  delivery_days_min: number;
  delivery_days_max: number;
  requirements?: PromotionRequirements;
  platform_specifics?: PromotionPlatformSpecifics;
  deliverables?: string[];
  terms?: string;
  featured_image?: string;
}

export type UpdatePromotionRequest = Partial<CreatePromotionRequest>;

export interface DisputeOrderRequest {
  reason: string;
  reason_code?: DisputeReasonCode;
  evidence_url?: string;
  evidence_files?: string[];
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

export const PROMOTION_AUDIENCE_NICHE_LABELS: Record<PromotionAudienceNiche, string> = {
  afrobeats: "Afrobeats",
  gospel: "Gospel",
  hip_hop: "Hip Hop",
  amapiano: "Amapiano",
  dancehall: "Dancehall",
  gen_z: "Gen Z",
  campus: "Campus",
  nightlife: "Nightlife",
  mainstream: "Mainstream",
  diaspora: "Diaspora",
};

export const PROMOTION_CONTENT_FORMAT_LABELS: Record<PromotionContentFormat, string> = {
  short_video: "Short Video",
  live_stream: "Live Stream",
  story_post: "Story Post",
  feed_post: "Feed Post",
  radio_spin: "Radio Spin",
  dj_drop: "DJ Drop",
  playlist_push: "Playlist Push",
  interview_feature: "Interview Feature",
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

export const DISPUTE_REASON_LABELS: Record<DisputeReasonCode, string> = {
  missing_delivery: "Delivery Missing",
  wrong_platform: "Wrong Platform or Channel",
  poor_quality_proof: "Weak or Invalid Proof",
  late_delivery: "Delivery Was Late",
  scope_mismatch: "Service Scope Was Not Met",
  fraud_or_spam: "Fraud or Spam Concern",
  other: "Other",
};
