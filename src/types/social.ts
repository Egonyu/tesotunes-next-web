// ============================================================================
// Universal Social System Types
// Maps to Laravel's polymorphic social API: /api/social/*
// ============================================================================

/** Commentable entity types accepted by the backend */
export type CommentableType =
  | 'song'
  | 'album'
  | 'artist'
  | 'playlist'
  | 'event'
  | 'product'
  | 'post'
  | 'podcast_episode'
  | 'loyalty_card'
  | 'campaign';

/** Likeable entity types accepted by the backend */
export type LikeableType =
  | 'song'
  | 'album'
  | 'artist'
  | 'playlist'
  | 'event'
  | 'product'
  | 'post'
  | 'comment'
  | 'podcast_episode'
  | 'loyalty_card';

/** Followable entity types accepted by the backend */
export type FollowableType =
  | 'artist'
  | 'user'
  | 'event'
  | 'loyalty_card'
  | 'campaign'
  | 'playlist';

// ============================================================================
// Comment Types
// ============================================================================

export interface CommentAuthor {
  id: number;
  name: string;
  username?: string;
  avatar_url: string | null;
  is_verified?: boolean;
}

export interface SocialComment {
  id: number;
  uuid?: string;
  content: string;
  user: CommentAuthor;
  parent_id: number | null;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
  is_edited: boolean;
  status: 'approved' | 'pending' | 'flagged' | 'hidden';
  replies?: SocialComment[];
  created_at: string;
  updated_at: string;
}

export interface CommentCreatePayload {
  commentable_type: CommentableType;
  commentable_id: number;
  content: string;
  parent_id?: number;
}

export interface CommentUpdatePayload {
  content: string;
}

export interface CommentsResponse {
  data: SocialComment[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ============================================================================
// Like Types
// ============================================================================

export interface LikeToggleResponse {
  success: boolean;
  data: {
    action: 'liked' | 'unliked';
    likes_count: number;
    is_liked: boolean;
  };
}

export interface LikeStatusResponse {
  success: boolean;
  data: {
    is_liked: boolean;
    likes_count: number;
  };
}

// ============================================================================
// Follow Types
// ============================================================================

export interface FollowToggleResponse {
  success: boolean;
  data: {
    action: 'followed' | 'unfollowed';
    followers_count: number;
    is_following: boolean;
  };
}

export interface FollowStatusResponse {
  success: boolean;
  data: {
    is_following: boolean;
    followers_count: number;
  };
}

// ============================================================================
// Activity Types (for Edula feed)
// ============================================================================

export type ActivityModule =
  | 'music'
  | 'events'
  | 'store'
  | 'sacco'
  | 'ojokotau'
  | 'loyalty'
  | 'forum'
  | 'awards'
  | 'podcasts';

export interface Activity {
  id: number;
  uuid?: string;
  user: CommentAuthor;
  activity_type: string;
  description: string;
  module: ActivityModule;
  priority: 'high' | 'medium' | 'low';
  is_prestige: boolean;
  subject_type: string;
  subject_id: number;
  subject?: Record<string, unknown>;
  media_urls?: string[];
  engagement_score: number;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface ActivityFeedResponse {
  data: Activity[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
