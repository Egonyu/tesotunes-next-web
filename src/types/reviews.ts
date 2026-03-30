export type ReviewableType =
  | "song"
  | "album"
  | "artist"
  | "playlist"
  | "event"
  | "post"
  | "award"
  | "poll"
  | "product"
  | "store"
  | "podcast"
  | "podcast_episode"
  | "forum_topic";

export interface ReviewAuthor {
  id: number;
  name: string;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface ReviewItem {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  not_helpful_count: number;
  seller_response: string | null;
  seller_response_at: string | null;
  metadata: Record<string, unknown>;
  is_helpful_marked: boolean | null;
  can_edit: boolean;
  can_delete: boolean;
  user: ReviewAuthor | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginatedReviewsResponse {
  success: boolean;
  data: {
    data: ReviewItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ReviewMutationResponse {
  success: boolean;
  message: string;
  data?: ReviewItem;
}

export interface CreateReviewRequest {
  reviewable_type: ReviewableType;
  reviewable_id: number;
  rating: number;
  title?: string;
  content: string;
  order_id?: number;
  is_verified_purchase?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  content?: string;
  metadata?: Record<string, unknown>;
}
