import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete, apiPostForm } from "@/lib/api";

// Re-export types from central location
export type {
  Post,
  PostAuthor,
  PostMedia,
  Comment,
  FeedResponse,
  TrendingItem,
  Announcement,
  SuggestedUser,
  FeedItem,
  FeedItemType,
  PostCardData,
} from "@/types/edula";

export { transformPost as transformPostToComponent } from "@/types/edula";

// Import for internal use
import type {
  Post,
  FeedResponse,
  Comment,
  TrendingItem,
  Announcement,
  SuggestedUser,
} from "@/types/edula";

// ============================================================================
// Feed Hooks
// ============================================================================

export function useFeed(type: 'for-you' | 'following' = 'for-you') {
  return useInfiniteQuery({
    queryKey: ['feed', type],
    queryFn: ({ pageParam = 1 }) =>
      apiGet<FeedResponse>(`/feed/${type}`, { params: { page: pageParam } }),
    getNextPageParam: (lastPage) =>
      lastPage?.meta?.current_page != null && lastPage?.meta?.last_page != null &&
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useDiscoverFeed() {
  return useQuery({
    queryKey: ['feed', 'discover'],
    queryFn: () => apiGet<{ data: Post[]; trending: TrendingItem[] }>('/feed/discover'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrending() {
  return useQuery({
    queryKey: ['feed', 'trending'],
    queryFn: () => apiGet<{ data: TrendingItem[] }>('/feed/trending'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiGet<{ data: Announcement[] }>('/announcements'),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Post Detail Hook
// ============================================================================

export function usePost(postId: number) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => apiGet<{ data: Post }>(`/posts/${postId}`),
    enabled: !!postId,
  });
}

export function usePostComments(postId: number) {
  return useInfiniteQuery({
    queryKey: ['post', postId, 'comments'],
    queryFn: ({ pageParam = 1 }) =>
      apiGet<{ data: Comment[]; meta: { current_page: number; last_page: number } }>(
        `/posts/${postId}/comments`,
        { params: { page: pageParam } }
      ),
    getNextPageParam: (lastPage) =>
      lastPage?.meta?.current_page != null && lastPage?.meta?.last_page != null &&
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!postId,
  });
}

// ============================================================================
// Post Actions
// ============================================================================

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      content: string;
      visibility?: string;
      song_id?: number;
      media?: File[];
      media_type?: string;
      media_id?: number;
      media_url?: string;
    }) => {
      // Use FormData when media files are attached
      if (data.media && data.media.length > 0) {
        const formData = new FormData();
        formData.append('content', data.content);
        if (data.visibility) formData.append('visibility', data.visibility);
        if (data.song_id) formData.append('song_id', String(data.song_id));
        data.media.forEach((file) => formData.append('media[]', file));
        return apiPostForm<{ data: Post }>('/posts', formData);
      }

      // JSON body for text-only posts
      return apiPost<{ data: Post }>('/posts', {
        content: data.content,
        visibility: data.visibility || 'public',
        song_id: data.song_id,
        media_type: data.media_type,
        media_id: data.media_id,
        media_url: data.media_url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => apiPost(`/posts/${postId}/like`, {}),
    onMutate: async (postId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: unknown) => {
        if (!old) return old;
        const typedOld = old as { pages: FeedResponse[] };
        return {
          ...typedOld,
          pages: typedOld.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post.id === postId
                ? { ...post, is_liked: true, likes_count: post.likes_count + 1 }
                : post
            ),
          })),
        };
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => apiDelete(`/posts/${postId}/like`),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: unknown) => {
        if (!old) return old;
        const typedOld = old as { pages: FeedResponse[] };
        return {
          ...typedOld,
          pages: typedOld.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post.id === postId
                ? { ...post, is_liked: false, likes_count: Math.max(0, post.likes_count - 1) }
                : post
            ),
          })),
        };
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useBookmarkPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => apiPost(`/posts/${postId}/bookmark`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

export function useUnbookmarkPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => apiDelete(`/posts/${postId}/bookmark`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

export function useRepost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { postId: number; comment?: string }) =>
      apiPost(`/posts/${data.postId}/repost`, { comment: data.comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => apiDelete(`/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// ============================================================================
// Comment Actions
// ============================================================================

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { postId: number; content: string; parentId?: number }) =>
      apiPost<{ data: Comment }>(`/posts/${data.postId}/comments`, {
        content: data.content,
        parent_id: data.parentId,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
}

export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => apiPost(`/comments/${commentId}/like`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { postId: number; commentId: number }) =>
      apiDelete(`/posts/${data.postId}/comments/${data.commentId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId, 'comments'] });
    },
  });
}

// ============================================================================
// Helper to transform API response to component format
// (kept for backward compat — prefer transformPost from @/types/edula)
// ============================================================================

export function transformPostToComponentLegacy(post: Post) {
  return {
    id: post.id,
    author: {
      id: post.author.id,
      name: post.author.name,
      username: `@${post.author.username}`,
      avatar: post.author.avatar_url,
      isVerified: post.author.is_verified,
    },
    content: post.content,
    media: post.media ? {
      type: post.media.type,
      url: post.media.url,
      thumbnail: post.media.thumbnail_url,
      title: post.media.title,
      artist: post.media.artist,
    } : undefined,
    createdAt: post.created_at,
    likes: post.likes_count,
    comments: post.comments_count,
    reposts: post.reposts_count,
    isLiked: post.is_liked,
    isReposted: post.is_reposted,
    isBookmarked: post.is_bookmarked,
  };
}

// ============================================================================
// User Follow/Unfollow Actions
// ============================================================================

export function useSuggestedUsers() {
  return useQuery({
    queryKey: ['suggested-users'],
    queryFn: () => apiGet<{ data: SuggestedUser[] }>('/users/suggested'),
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => apiPost(`/users/${userId}/follow`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-users'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'following'] });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => apiDelete(`/users/${userId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-users'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'following'] });
    },
  });
}

// ============================================================================
// Edula Feed-Item Actions (from Edula doc API)
// ============================================================================

/** Refresh the feed — POST /edula/refresh */
export function useRefreshFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<{ new_items_count: number }>('/edula/refresh', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/** Mark a feed item as not-interested — POST /edula/items/{uuid}/not-interested */
export function useNotInterested() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { uuid: string; reason?: string }) =>
      apiPost(`/edula/items/${data.uuid}/not-interested`, { reason: data.reason || 'not_relevant' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/** Save a feed item — POST /edula/items/{uuid}/save */
export function useSaveFeedItem() {
  return useMutation({
    mutationFn: (uuid: string) => apiPost(`/edula/items/${uuid}/save`, {}),
  });
}

/** Track interaction — POST /edula/items/{uuid}/track */
export function useTrackInteraction() {
  return useMutation({
    mutationFn: (data: { uuid: string; action: 'click' | 'view' | 'like' | 'share'; duration?: number }) =>
      apiPost(`/edula/items/${data.uuid}/track`, {
        action: data.action,
        duration: data.duration,
      }),
  });
}

