// ============================================================================
// Universal Social API Client
// Maps to Laravel's social endpoints:
//   Comments:  /api/comments/*
//   Likes:     /api/like/{type}/{id}
//   Follows:   /api/artists/{id}/follow
// ============================================================================

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { API_ORIGIN } from '@/lib/api-config';
import type {
  CommentableType,
  LikeableType,
  FollowableType,
  SocialComment,
  CommentCreatePayload,
  CommentsResponse,
  LikeToggleResponse,
  LikeStatusResponse,
  FollowToggleResponse,
  FollowStatusResponse,
} from '@/types/social';

// ── Internal types for raw Laravel responses ─────────────────────────────────

/** Raw paginator shape returned by Laravel's ->paginate() wrapped in { success, data } */
interface LaravelPaginatedResponse<T> {
  success: boolean;
  data: {
    current_page: number;
    data: T[];
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawComment = Record<string, any>;

/** Transform a raw backend comment into the SocialComment shape the frontend expects */
function mapComment(raw: RawComment): SocialComment {
  const user = raw.user ?? {};
  const avatarPath: string | null = user.avatar ?? null;
  const avatarUrl = avatarPath
    ? (avatarPath.startsWith('http') ? avatarPath : `${API_ORIGIN}/storage/${avatarPath}`)
    : null;

  return {
    id: raw.id,
    uuid: raw.uuid,
    content: raw.content ?? '',
    user: {
      id: user.id,
      name: user.display_name || user.name || 'Unknown',
      username: user.username,
      avatar_url: avatarUrl,
      is_verified: Boolean(user.is_verified),
    },
    parent_id: raw.parent_id ?? null,
    likes_count: raw.likes_count ?? 0,
    replies_count: raw.replies_count ?? 0,
    is_liked: Boolean(raw.is_liked),
    is_edited: raw.updated_at !== raw.created_at && Boolean(raw.content),
    status: raw.status ?? 'approved',
    replies: Array.isArray(raw.replies)
      ? raw.replies.map(mapComment)
      : [],
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export const socialApi = {
  // ========================================================================
  // Comments — /api/comments/*
  // ========================================================================

  /** Get comments for any commentable entity */
  async getComments(
    type: CommentableType,
    id: number,
    params?: { page?: number; per_page?: number; sort?: 'latest' | 'oldest' | 'popular' }
  ): Promise<CommentsResponse> {
    const raw = await apiGet<LaravelPaginatedResponse<RawComment>>(
      `/comments/${type}/${id}`,
      { params }
    );

    // Reshape Laravel paginator + transform raw comments into SocialComment shape
    return {
      data: (raw.data?.data ?? []).map(mapComment),
      meta: {
        current_page: raw.data?.current_page ?? 1,
        last_page: raw.data?.last_page ?? 1,
        per_page: raw.data?.per_page ?? 15,
        total: raw.data?.total ?? 0,
      },
    };
  },

  /** Create a comment on any commentable entity */
  createComment(payload: CommentCreatePayload) {
    return apiPost<{ data: SocialComment }>('/comments', payload);
  },

  /** Update a comment */
  updateComment(commentId: number, content: string) {
    return apiPut<{ data: SocialComment }>(`/comments/${commentId}`, { content });
  },

  /** Delete a comment */
  deleteComment(commentId: number) {
    return apiDelete<{ success: boolean }>(`/comments/${commentId}`);
  },

  /** Reply to a comment */
  replyToComment(payload: CommentCreatePayload & { parent_id: number }) {
    return apiPost<{ data: SocialComment }>('/comments', payload);
  },

  /** Like a comment */
  likeComment(commentId: number) {
    return apiPost<LikeToggleResponse>(`/comments/${commentId}/like`);
  },

  // ========================================================================
  // Likes — /api/like/{type}/{id}
  // ========================================================================

  /** Toggle like on any likeable entity */
  toggleLike(type: LikeableType, id: number) {
    return apiPost<LikeToggleResponse>(`/like/${type}/${id}`);
  },

  /** Check like status for an entity */
  async getLikeStatus(type: LikeableType, id: number): Promise<LikeStatusResponse> {
    try {
      return await apiGet<LikeStatusResponse>(`/like/${type}/${id}/status`);
    } catch {
      // Returns default for unauthenticated users (401) or other errors
      return {
        success: true,
        data: { is_liked: false, likes_count: 0 },
      };
    }
  },

  // ========================================================================
  // Follows — /api/artists/{id}/follow
  // ========================================================================

  /** Toggle follow on any followable entity */
  toggleFollow(type: FollowableType, id: number, isCurrentlyFollowing: boolean) {
    if (isCurrentlyFollowing) {
      return apiDelete<FollowToggleResponse>(`/artists/${id}/follow`);
    }
    return apiPost<FollowToggleResponse>(`/artists/${id}/follow`);
  },

  /** Check follow status for an entity */
  async getFollowStatus(type: FollowableType, id: number): Promise<FollowStatusResponse> {
    try {
      if (type === 'artist') {
        return await apiGet<FollowStatusResponse>(`/artists/${id}/follow/status`);
      }
      return await apiGet<FollowStatusResponse>(`/artists/${id}/follow/status`);
    } catch {
      // Returns default for unauthenticated users (401) or other errors
      return { success: true, data: { is_following: false, followers_count: 0 } };
    }
  },
};
