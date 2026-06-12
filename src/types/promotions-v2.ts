// ============================================================================
// TesoTunes Promotions V2 — Type Definitions
// Matches app/Modules/Promotions/Models/* exactly
// ============================================================================

// ---------------------------------------------------------------------------
// Enums / Literal Unions
// ---------------------------------------------------------------------------

export type PromoterStatus = "active" | "paused" | "suspended";
export type PromoterTier = "starter" | "rising" | "established" | "elite";
export type OpportunityStatus =
  | "draft"
  | "open"
  | "reviewing"
  | "awarded"
  | "closed"
  | "cancelled";
export type ApplicationStatus =
  | "submitted"
  | "shortlisted"
  | "awarded"
  | "rejected"
  | "withdrawn";
export type PromotableType = "song" | "album";

// ---------------------------------------------------------------------------
// Shared shapes
// ---------------------------------------------------------------------------

export interface UserSummaryV2 {
  id: number;
  username: string | null;
  avatar: string | null;
}

export interface PortfolioItemV2 {
  title: string;
  summary?: string | null;
  outcome?: string | null;
  platform?: string | null;
  asset_url?: string | null;
  external_url?: string | null;
}

export interface PromotableContent {
  id: number;
  title?: string;
  name?: string;
  slug: string;
  type: PromotableType;
  artwork_url?: string | null;
  artist?: { id: number; name: string; slug: string };
}

// ---------------------------------------------------------------------------
// Core Models
// ---------------------------------------------------------------------------

export interface PromoterProfileV2 {
  id: number;
  uuid: string;
  user_id: number;
  store_id: number | null;
  display_name: string;
  slug: string;
  bio: string | null;
  platforms: string[] | null;
  niches: string[] | null;
  audience_regions: string[] | null;
  audience_summary: string | null;
  social_links: Record<string, string> | null;
  portfolio_items: PortfolioItemV2[] | null;
  proof_points: string[] | null;
  campaign_highlights: string[] | null;
  response_time_hours: number | null;
  status: PromoterStatus;
  tier: PromoterTier;
  is_verified: boolean;
  verified_at: string | null;
  total_listings: number;
  total_completed_orders: number;
  average_rating: string | null;
  review_count: number;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
  user?: UserSummaryV2;
}

export interface PromotionOpportunityV2 {
  id: number;
  uuid: string;
  created_by_user_id: number;
  promotable_type: string;
  promotable_id: number;
  title: string;
  brief: string | null;
  target_platforms: string[] | null;
  target_audience_niches: string[] | null;
  target_regions: string[] | null;
  budget_min_ugx: number;
  budget_max_ugx: number;
  budget_credits: number;
  deadline_at: string | null;
  status: OpportunityStatus;
  slug: string | null;
  view_count: number;
  application_count: number;
  deliverables: string[] | null;
  metadata: Record<string, unknown> | null;
  awarded_application_id: number | null;
  awarded_at: string | null;
  created_at: string;
  updated_at: string;
  creator?: UserSummaryV2;
  promotable?: PromotableContent;
  applications?: PromotionApplicationV2[];
  awarded_application?: PromotionApplicationV2 | null;
}

export interface PromotionApplicationV2 {
  id: number;
  uuid: string;
  opportunity_id: number;
  promoter_profile_id: number;
  applicant_user_id: number;
  proposed_price_ugx: number;
  proposed_price_credits: number;
  pitch_message: string | null;
  proposed_deliverables: string[] | null;
  proposed_timeline_days: number | null;
  status: ApplicationStatus;
  artist_response: string | null;
  reviewed_at: string | null;
  order_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  opportunity?: PromotionOpportunityV2;
  promoter_profile?: PromoterProfileV2;
  applicant?: UserSummaryV2;
}

// ---------------------------------------------------------------------------
// Activity Hub
// ---------------------------------------------------------------------------

export interface ActivityHubSummary {
  data: {
    wallet: {
      ugx_balance: number;
      credits: number;
    };
    promoter:
      | {
          is_promoter: true;
          display_name: string;
          slug: string;
          tier: PromoterTier;
          is_verified: boolean;
          average_rating: string | null;
          total_completed_orders: number;
        }
      | { is_promoter: false };
    pending_actions: {
      buyer_orders_awaiting_review: number;
      seller_orders_to_verify: number;
      open_opportunities: number;
      pending_applications: number;
    };
  };
}

export interface ActivityHubWallet {
  data: {
    ugx_balance: number;
    credits: number;
  };
}

export interface ActivityHubEarnings {
  data: {
    total_ugx: number;
    total_credits: number;
    orders: PaginatedV2<Record<string, unknown>>;
  };
}

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

export interface OnboardAsPromoterRequest {
  display_name?: string;
  slug?: string;
  bio?: string;
  platforms?: string[];
  niches?: string[];
  audience_regions?: string[];
  audience_summary?: string;
  social_links?: Record<string, string>;
  response_time_hours?: number;
}

export interface UpdatePromoterProfileV2Request {
  display_name?: string;
  bio?: string;
  platforms?: string[];
  niches?: string[];
  audience_regions?: string[];
  audience_summary?: string;
  social_links?: Record<string, string>;
  portfolio_items?: PortfolioItemV2[];
  proof_points?: string[];
  campaign_highlights?: string[];
  response_time_hours?: number;
}

export interface CreateOpportunityRequest {
  promotable_type: PromotableType;
  promotable_id: number;
  title: string;
  brief?: string;
  target_platforms?: string[];
  target_audience_niches?: string[];
  target_regions?: string[];
  budget_min_ugx?: number;
  budget_max_ugx?: number;
  budget_credits?: number;
  deadline_at?: string;
  deliverables?: string[];
}

export type UpdateOpportunityRequest = Partial<
  Omit<CreateOpportunityRequest, "promotable_type" | "promotable_id">
>;

export interface ApplyToOpportunityRequest {
  proposed_price_ugx?: number;
  proposed_price_credits?: number;
  pitch_message?: string;
  proposed_deliverables?: string[];
  proposed_timeline_days?: number;
}

// ---------------------------------------------------------------------------
// Browse / Filter params
// ---------------------------------------------------------------------------

export interface BrowseOpportunitiesParams {
  platform?: string;
  niche?: string;
  region?: string;
  promotable_type?: PromotableType;
  per_page?: number;
  page?: number;
}

export interface BrowsePromotersParams {
  platform?: string;
  niche?: string;
  tier?: PromoterTier;
  search?: string;
  per_page?: number;
  page?: number;
}

// ---------------------------------------------------------------------------
// Pagination wrapper (matches Laravel paginator shape)
// ---------------------------------------------------------------------------

export interface PaginatedV2<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  draft: "Draft",
  open: "Open",
  reviewing: "Reviewing",
  awarded: "Awarded",
  closed: "Closed",
  cancelled: "Cancelled",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  shortlisted: "Shortlisted",
  awarded: "Awarded",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const PROMOTER_TIER_LABELS: Record<PromoterTier, string> = {
  starter: "Starter",
  rising: "Rising",
  established: "Established",
  elite: "Elite",
};

// ---------------------------------------------------------------------------
// Admin-only extended types
// ---------------------------------------------------------------------------

export interface AdminUserSummary {
  id: number;
  name: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
}

export interface AdminPromoterProfile extends Omit<PromoterProfileV2, "user"> {
  user: AdminUserSummary | null;
}

export interface AdminOpportunityCreator {
  id: number;
  name: string;
  username: string | null;
  avatar_url: string | null;
}

export interface AdminOpportunity extends Omit<PromotionOpportunityV2, "creator" | "promotable"> {
  creator: AdminOpportunityCreator | null;
  promotable: { id: number; title: string | null; type: string } | null;
}

export interface AdminApplication {
  id: number;
  uuid: string;
  status: ApplicationStatus;
  pitch_message: string | null;
  proposed_price_ugx: number;
  proposed_price_credits: number;
  proposed_timeline_days: number;
  artist_response: string | null;
  reviewed_at: string | null;
  promoter: AdminPromoterProfile | null;
  created_at: string;
}

export interface AdminOpportunityApplicationsResponse {
  opportunity: AdminOpportunity;
  data: AdminApplication[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminSetTierRequest {
  tier: PromoterTier;
}
