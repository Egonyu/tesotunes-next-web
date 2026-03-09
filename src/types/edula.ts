// ============================================================================
// Edula (Community Hub) Types
// ============================================================================

export interface PostAuthor {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
  is_verified: boolean;
  bio?: string;
}

export interface PostMedia {
  type: 'image' | 'video' | 'song' | 'album';
  url: string;
  thumbnail_url?: string;
  title?: string;
  artist?: string;
  song_id?: number;
  album_id?: number;
}

export interface Post {
  id: number;
  uuid?: string;
  author: PostAuthor;
  content: string;
  media?: PostMedia;
  visibility?: 'public' | 'followers' | 'private';
  created_at: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  views_count?: number;
  is_liked: boolean;
  is_reposted: boolean;
  is_bookmarked: boolean;
  trending_rank?: number;
}

export interface Comment {
  id: number;
  author: PostAuthor;
  content: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  replies_count: number;
  replies?: Comment[];
}

export interface FeedResponse {
  data: Post[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface FeedItem {
  id: number;
  uuid: string;
  type: FeedItemType;
  module: FeedModule;
  title: string | null;
  body: string | null;
  actor: FeedActor;
  media: FeedMedia | null;
  engagement: FeedEngagement;
  tags: string[];
  actions: FeedAction[];
  extras: Record<string, unknown>;
  is_prestige: boolean;
  has_celebration: boolean;
  is_aggregated: boolean;
  aggregation_count: number;
  source: 'post' | 'feed_item';
  published_at: string;
  expires_at: string | null;
  // Legacy compat fields (from FeedController transform)
  description?: string;
  image?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  feedable_type?: string;
  feedable_id?: number;
}

export interface FeedActor {
  id: number | null;
  name: string;
  avatar_url: string | null;
  verified: boolean;
  type: string;
}

export interface FeedMedia {
  type: 'song' | 'album' | 'image' | 'video' | 'playlist' | string;
  url: string | null;
  thumbnail_url: string | null;
  duration_seconds?: number;
  audio_url?: string;
}

export interface FeedEngagement {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export interface FeedAction {
  type: 'play' | 'view' | 'register' | 'vote' | 'buy' | string;
  label: string;
  url: string;
}

export type FeedModule =
  | 'music'
  | 'social'
  | 'events'
  | 'awards'
  | 'store'
  | 'sacco'
  | 'ojokotau'
  | 'loyalty'
  | 'forum'
  | 'podcasts'
  | 'platform';

export type FeedItemType =
  // Music
  | 'song_release'
  | 'album_release'
  | 'playlist_created'
  | 'song_milestone'
  | 'artist_update'
  | 'artist_joined'
  // Events
  | 'event_created'
  | 'event_reminder'
  | 'ticket_purchased'
  | 'event_attended'
  // Awards
  | 'nomination_submitted'
  | 'award_won'
  | 'award_season_started'
  | 'award_voted'
  // Store
  | 'product_purchased'
  | 'product_reviewed'
  | 'store_created'
  // SACCO
  | 'sacco_joined'
  | 'loan_taken'
  | 'loan_repaid'
  | 'dividend_received'
  | 'sacco_milestone'
  // Loyalty
  | 'fan_club_joined'
  | 'reward_redeemed'
  | 'points_milestone'
  // Forum / Polls
  | 'thread_created'
  | 'reply_posted'
  | 'poll_created'
  | 'poll_ended'
  // Podcasts
  | 'episode_published'
  | 'podcast_milestone'
  // Ojokotau
  | 'campaign_created'
  | 'campaign_funded'
  | 'campaign_milestone'
  // Promotions
  | 'promotion_started'
  | 'promotion_featured'
  // Social
  | 'user_post'
  | 'user_activity'
  | 'user_followed'
  | 'comment_posted'
  | 'shared_content'
  // Platform
  | 'announcement'
  // Legacy / generic
  | 'artist_activity'
  | 'friend_activity'
  | 'platform_event'
  | 'forum_post'
  | 'poll'
  | 'recommendation';

export interface TrendingItem {
  id: number;
  type: 'hashtag' | 'topic' | 'song' | 'artist';
  title: string;
  subtitle?: string;
  count: number;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'event';
  link_url?: string;
  link_text?: string;
  image_url?: string;
  is_pinned?: boolean;
  created_at: string;
  expires_at?: string;
}

export interface SuggestedUser {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
  is_verified: boolean;
  bio: string;
  followers_count: number;
  is_following: boolean;
}

export type FeedFilter = 'all' | 'following' | 'recommendations' | 'artists' | 'events';

// ── Feed Card Sizing ───────────────────────────────────────────
// Variable card heights based on content type (ChatGPT discovery feed spec)

export type FeedCardSize = 'compact' | 'standard' | 'featured' | 'hero';

/** Determine display size for a feed item based on type + prestige */
export function getFeedCardSize(item: FeedItem): FeedCardSize {
  if (item.is_prestige || item.has_celebration) return 'hero';
  if (item.is_aggregated && item.aggregation_count > 3) return 'compact';

  switch (item.type) {
    case 'song_release':
    case 'album_release':
    case 'episode_published':
      return 'featured';
    case 'event_created':
    case 'award_won':
    case 'award_season_started':
    case 'campaign_created':
    case 'announcement':
      return 'standard';
    case 'user_followed':
    case 'comment_posted':
    case 'shared_content':
    case 'user_activity':
    case 'reply_posted':
      return 'compact';
    default:
      return 'standard';
  }
}

/** Unified feed content — either a Post or a FeedItem */
export type MixedFeedContent =
  | { source: 'post'; data: Post }
  | { source: 'feed_item'; data: FeedItem };

/** Transform backend's forYou response into typed mixed content */
export function classifyFeedContent(
  raw: Record<string, unknown>
): MixedFeedContent {
  // Classify as feed_item if explicitly tagged or if it lacks a post-like author field
  if (raw.source === 'feed_item' || raw.feed_type || (!raw.author && !raw.content)) {
    return { source: 'feed_item', data: raw as unknown as FeedItem };
  }
  return { source: 'post', data: raw as unknown as Post };
}

// ── Module Color/Icon Map ──────────────────────────────────────

export const MODULE_STYLES: Record<
  string,
  { color: string; icon: string; label: string }
> = {
  music:    { color: '#8B5CF6', icon: '🎵', label: 'Music' },
  social:   { color: '#3B82F6', icon: '👥', label: 'Social' },
  events:   { color: '#F59E0B', icon: '📅', label: 'Events' },
  awards:   { color: '#EF4444', icon: '🏆', label: 'Awards' },
  store:    { color: '#10B981', icon: '🛍️', label: 'Store' },
  sacco:    { color: '#14B8A6', icon: '💰', label: 'SACCO' },
  ojokotau: { color: '#F97316', icon: '🤝', label: 'Ojokotau' },
  loyalty:  { color: '#EC4899', icon: '⭐', label: 'Loyalty' },
  forum:    { color: '#6366F1', icon: '💬', label: 'Forum' },
  podcasts: { color: '#8B5CF6', icon: '🎙️', label: 'Podcasts' },
  platform: { color: '#6B7280', icon: '📢', label: 'Platform' },
};

// Component-level types (transformed from API)
export interface PostCardData {
  id: number;
  uuid?: string;
  author: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  media?: {
    type: 'image' | 'video' | 'song' | 'album';
    url: string;
    thumbnail?: string;
    title?: string;
    artist?: string;
  };
  visibility?: 'public' | 'followers' | 'private';
  createdAt: string;
  likes: number;
  comments: number;
  reposts: number;
  views?: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  trendingRank?: number;
}

/** Transform API Post to component-friendly PostCardData */
export function transformPost(post: Post): PostCardData {
  const author = post.author ?? { id: 0, name: 'Unknown', username: 'unknown', avatar_url: '', is_verified: false };
  return {
    id: post.id,
    uuid: post.uuid,
    author: {
      id: author.id,
      name: author.name,
      username: author.username?.startsWith('@')
        ? author.username
        : `@${author.username ?? 'unknown'}`,
      avatar: author.avatar_url ?? '',
      isVerified: author.is_verified ?? false,
    },
    content: post.content,
    media: post.media
      ? {
          type: post.media.type,
          url: post.media.url,
          thumbnail: post.media.thumbnail_url,
          title: post.media.title,
          artist: post.media.artist,
        }
      : undefined,
    visibility: post.visibility,
    createdAt: post.created_at,
    likes: post.likes_count,
    comments: post.comments_count,
    reposts: post.reposts_count,
    views: post.views_count,
    isLiked: post.is_liked,
    isReposted: post.is_reposted,
    isBookmarked: post.is_bookmarked,
    trendingRank: post.trending_rank,
  };
}
