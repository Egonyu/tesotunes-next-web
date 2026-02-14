import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface PostAuthor {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
  is_verified: boolean;
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
  author: PostAuthor;
  content: string;
  media?: PostMedia;
  created_at: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  is_liked: boolean;
  is_reposted: boolean;
  is_bookmarked: boolean;
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
  created_at: string;
  expires_at?: string;
}

// ============================================================================
// Feed Hooks
// ============================================================================

export function useFeed(type: 'for-you' | 'following' = 'for-you') {
  return useInfiniteQuery({
    queryKey: ['feed', type],
    queryFn: ({ pageParam = 1 }) => 
      apiGet<FeedResponse>(`/feed/${type}`, { params: { page: pageParam } }),
    getNextPageParam: (lastPage) => 
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
    mutationFn: (data: { content: string; media_type?: string; media_id?: number; media_url?: string }) =>
      apiPost<{ data: Post }>('/posts', data),
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
// ============================================================================

export function transformPostToComponent(post: Post) {
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

interface SuggestedUser {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
  is_verified: boolean;
  bio: string;
  followers_count: number;
  is_following: boolean;
}

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
