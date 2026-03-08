// ============================================================================
// Universal Social Hooks
// React Query hooks for polymorphic comments, likes, and follows
// ============================================================================

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { socialApi } from '@/lib/social-api';
import { toast } from 'sonner';
import type {
  CommentableType,
  LikeableType,
  FollowableType,
  CommentsResponse,
} from '@/types/social';

// ============================================================================
// Comment Hooks
// ============================================================================

/** Fetch paginated comments for any entity */
export function useComments(
  type: CommentableType,
  id: number,
  options?: { sort?: 'latest' | 'oldest' | 'popular'; enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ['social', 'comments', type, id, options?.sort],
    queryFn: ({ pageParam = 1 }) =>
      socialApi.getComments(type, id, {
        page: pageParam,
        per_page: 15,
        sort: options?.sort ?? 'latest',
      }),
    getNextPageParam: (lastPage: CommentsResponse) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
    enabled: options?.enabled !== false && !!id,
  });
}

/** Create a comment on any entity */
export function useCreateComment(type: CommentableType, id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string; parent_id?: number }) =>
      socialApi.createComment({
        commentable_type: type,
        commentable_id: id,
        content: data.content,
        parent_id: data.parent_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['social', 'comments', type, id],
      });
    },
  });
}

/** Update a comment */
export function useUpdateComment(type: CommentableType, entityId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { commentId: number; content: string }) =>
      socialApi.updateComment(data.commentId, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['social', 'comments', type, entityId],
      });
    },
  });
}

/** Delete a comment */
export function useDeleteSocialComment(type: CommentableType, entityId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => socialApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['social', 'comments', type, entityId],
      });
    },
  });
}

/** Like a comment */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => socialApi.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'comments'] });
    },
  });
}

// ============================================================================
// Like Hooks
// ============================================================================

/** Get like status for any entity */
export function useLikeStatus(
  type: LikeableType,
  id: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['social', 'like', type, id],
    queryFn: () => socialApi.getLikeStatus(type, id),
    enabled: options?.enabled !== false && !!id,
    staleTime: 30 * 1000,
  });
}

/** Toggle like on any entity with optimistic update */
export function useToggleLike(type: LikeableType, id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => socialApi.toggleLike(type, id),
    onMutate: async () => {
      const queryKey = ['social', 'like', type, id];
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (!old) {
          // First interaction — no cached state yet, assume "not liked" → "liked"
          return { success: true, data: { is_liked: true, likes_count: 1 } };
        }
        const typedOld = old as { success: boolean; data: { is_liked: boolean; likes_count: number } };
        const wasLiked = typedOld.data.is_liked;
        return {
          ...typedOld,
          data: {
            is_liked: !wasLiked,
            likes_count: wasLiked
              ? Math.max(0, typedOld.data.likes_count - 1)
              : typedOld.data.likes_count + 1,
          },
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['social', 'like', type, id], context.previous);
      }
      toast.error('Failed to update like');
    },
    onSuccess: (res) => {
      // Map backend response { data: { liked, like_count } } into cache format
      const queryKey = ['social', 'like', type, id];
      const raw = res as { data?: { liked?: boolean; like_count?: number }; credits_earned?: number } | undefined;
      if (raw?.data) {
        queryClient.setQueryData(queryKey, {
          success: true,
          data: {
            is_liked: raw.data.liked ?? false,
            likes_count: raw.data.like_count ?? 0,
          },
        });
      }
      if (raw?.credits_earned && raw.credits_earned > 0) {
        toast.success(`+${raw.credits_earned} credit earned!`, {
          duration: 2500,
          icon: "❤️",
        });
      }
    },
  });
}

// ============================================================================
// Follow Hooks
// ============================================================================

/** Get follow status for any entity */
export function useFollowStatus(
  type: FollowableType,
  id: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['social', 'follow', type, id],
    queryFn: () => socialApi.getFollowStatus(type, id),
    enabled: options?.enabled !== false && !!id,
    staleTime: 30 * 1000,
  });
}

/** Toggle follow on any entity with optimistic update */
export function useToggleFollow(type: FollowableType, id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    // isCurrentlyFollowing is passed from the component via mutate(boolean)
    mutationFn: (isCurrentlyFollowing: boolean) => {
      return socialApi.toggleFollow(type, id, isCurrentlyFollowing);
    },
    onMutate: async (isCurrentlyFollowing: boolean) => {
      const queryKey = ['social', 'follow', type, id];
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (!old) {
          return { success: true, data: { is_following: !isCurrentlyFollowing, followers_count: isCurrentlyFollowing ? 0 : 1 } };
        }
        const typedOld = old as { success: boolean; data: { is_following: boolean; followers_count: number } };
        return {
          ...typedOld,
          data: {
            is_following: !isCurrentlyFollowing,
            followers_count: isCurrentlyFollowing
              ? Math.max(0, typedOld.data.followers_count - 1)
              : typedOld.data.followers_count + 1,
          },
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['social', 'follow', type, id], context.previous);
      }
      toast.error('Failed to update follow');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'follow', type, id] });
    },
  });
}
