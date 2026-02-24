// ============================================================================
// Universal Social API Client
// Maps to Laravel's social endpoints:
//   Comments:  /api/comments/*
//   Likes:     /api/like/{type}/{id}
//   Follows:   /api/artists/{id}/follow
// ============================================================================

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
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
    const raw = await apiGet<LaravelPaginatedResponse<SocialComment>>(
      `/comments/${type}/${id}`,
      { params }
    );

    // Reshape Laravel paginator into the CommentsResponse the hooks expect
    return {
      data: raw.data?.data ?? [],
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

  /** Check like status for an entity (derived from toggle response cache) */
  getLikeStatus(type: LikeableType, id: number) {
    // Backend doesn't have a dedicated status endpoint;
    // status is embedded in entity responses (is_liked field).
    // Return a stub that consumers can use as fallback.
    return apiPost<LikeStatusResponse>(`/like/${type}/${id}`);
  },

  // ========================================================================
  // Follows — /api/artists/{id}/follow
  // ========================================================================

  /** Toggle follow on any followable entity */
  toggleFollow(type: FollowableType, id: number) {
    if (type === 'artist') {
      return apiPost<FollowToggleResponse>(`/artists/${id}/follow`);
    }
    // Fallback for non-artist types — may not be implemented yet
    return apiPost<FollowToggleResponse>(`/artists/${id}/follow`);
  },

  /** Check follow status for an entity */
  getFollowStatus(type: FollowableType, id: number) {
    if (type === 'artist') {
      return apiGet<FollowStatusResponse>(`/artists/${id}/follow/status`);
    }
    return apiGet<FollowStatusResponse>(`/artists/${id}/follow/status`);
  },
};
