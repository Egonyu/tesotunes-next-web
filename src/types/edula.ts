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
  uuid: string;
  type: FeedItemType;
  title: string;
  description?: string;
  image?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  feedable_type?: string;
  feedable_id?: number;
}

export type FeedItemType =
  | 'song_release'
  | 'album_release'
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
  return {
    id: post.id,
    uuid: post.uuid,
    author: {
      id: post.author.id,
      name: post.author.name,
      username: post.author.username.startsWith('@')
        ? post.author.username
        : `@${post.author.username}`,
      avatar: post.author.avatar_url,
      isVerified: post.author.is_verified,
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
