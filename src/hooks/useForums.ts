'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

export interface ForumCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  topic_count: number;
  post_count: number;
  last_post?: {
    id: number;
    topic_title: string;
    topic_slug: string;
    author_name: string;
    author_avatar: string;
    created_at: string;
  };
}

export interface ForumTopic {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  views: number;
  reply_count: number;
  like_count: number;
  is_liked: boolean;
  category: {
    id: number;
    slug: string;
    name: string;
  };
  author: {
    id: number;
    name: string;
    username: string;
    avatar_url: string;
    is_verified: boolean;
  };
  last_reply?: {
    author_name: string;
    author_avatar: string;
    created_at: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: number;
  content: string;
  like_count: number;
  is_liked: boolean;
  is_solution: boolean;
  author: {
    id: number;
    name: string;
    username: string;
    avatar_url: string;
    is_verified: boolean;
    post_count: number;
    joined_at: string;
  };
  created_at: string;
  updated_at: string;
}

interface CategoriesResponse {
  data: ForumCategory[];
}

interface TopicsResponse {
  data: ForumTopic[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface TopicDetailResponse {
  data: ForumTopic;
}

interface PostsResponse {
  data: ForumPost[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ============================================================================
// Categories
// ============================================================================

export function useForumCategories() {
  return useQuery({
    queryKey: ['forum', 'categories'],
    queryFn: () => apiGet<CategoriesResponse>('/forums/categories'),
  });
}

export function useForumCategory(slug: string) {
  return useQuery({
    queryKey: ['forum', 'category', slug],
    queryFn: () => apiGet<{ data: ForumCategory }>(`/forums/categories/${slug}`),
    enabled: !!slug,
  });
}

// ============================================================================
// Topics
// ============================================================================

export function useForumTopics(categorySlug?: string, sort: 'latest' | 'popular' | 'unanswered' = 'latest') {
  return useInfiniteQuery({
    queryKey: ['forum', 'topics', categorySlug, sort],
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: pageParam.toString(), sort });
      if (categorySlug) params.append('category', categorySlug);
      return apiGet<TopicsResponse>(`/forums/topics?${params}`);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useTrendingTopics(limit: number = 5) {
  return useQuery({
    queryKey: ['forum', 'trending'],
    queryFn: () => apiGet<{ data: ForumTopic[] }>(`/forums/topics/trending?limit=${limit}`),
  });
}

export function useForumTopic(categorySlug: string, topicSlug: string) {
  return useQuery({
    queryKey: ['forum', 'topic', categorySlug, topicSlug],
    queryFn: () => apiGet<TopicDetailResponse>(`/forums/categories/${categorySlug}/topics/${topicSlug}`),
    enabled: !!categorySlug && !!topicSlug,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { 
      category_id: number; 
      title: string; 
      content: string; 
      tags?: string[] 
    }) => apiPost<{ success: boolean; data: ForumTopic }>('/forums/topics', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'categories'] });
    },
  });
}

export function useLikeTopic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (topicId: number) => apiPost(`/forums/topics/${topicId}/like`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum'] });
    },
  });
}

export function useUnlikeTopic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (topicId: number) => apiDelete(`/forums/topics/${topicId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum'] });
    },
  });
}

// ============================================================================
// Posts (Replies)
// ============================================================================

export function useTopicPosts(topicId: number) {
  return useInfiniteQuery({
    queryKey: ['forum', 'posts', topicId],
    queryFn: ({ pageParam = 1 }) => 
      apiGet<PostsResponse>(`/forums/topics/${topicId}/posts?page=${pageParam}`),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!topicId,
  });
}

export function useCreateForumPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { topicId: number; content: string; quotedPostId?: number }) =>
      apiPost<{ success: boolean; data: ForumPost }>(`/forums/topics/${data.topicId}/posts`, {
        content: data.content,
        quoted_post_id: data.quotedPostId,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'posts', variables.topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'topic'] });
    },
  });
}

export function useLikeForumPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => apiPost(`/forums/posts/${postId}/like`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'posts'] });
    },
  });
}

export function useUnlikeForumPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => apiDelete(`/forums/posts/${postId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'posts'] });
    },
  });
}

export function useMarkAsSolution() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { topicId: number; postId: number }) =>
      apiPost(`/forums/topics/${data.topicId}/solution`, { post_id: data.postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum'] });
    },
  });
}

export function useDeleteForumPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => apiDelete(`/forums/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'posts'] });
    },
  });
}

// ============================================================================
// Helper Transformers
// ============================================================================

export function transformCategory(category: ForumCategory) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    icon: category.icon,
    color: category.color,
    topicCount: category.topic_count,
    postCount: category.post_count,
    lastPost: category.last_post ? {
      topic: category.last_post.topic_title,
      topicSlug: category.last_post.topic_slug,
      author: category.last_post.author_name,
      avatar: category.last_post.author_avatar,
      date: category.last_post.created_at,
    } : undefined,
  };
}

export function transformTopic(topic: ForumTopic) {
  return {
    id: topic.id,
    slug: topic.slug,
    title: topic.title,
    content: topic.content,
    isPinned: topic.is_pinned,
    isLocked: topic.is_locked,
    views: topic.views,
    replies: topic.reply_count,
    likes: topic.like_count,
    isLiked: topic.is_liked,
    category: topic.category.name,
    categorySlug: topic.category.slug,
    author: {
      id: topic.author.id,
      name: topic.author.name,
      username: `@${topic.author.username}`,
      avatar: topic.author.avatar_url,
      isVerified: topic.author.is_verified,
    },
    lastReply: topic.last_reply ? {
      author: topic.last_reply.author_name,
      avatar: topic.last_reply.author_avatar,
      date: topic.last_reply.created_at,
    } : undefined,
    createdAt: topic.created_at,
    updatedAt: topic.updated_at,
  };
}

export function transformPost(post: ForumPost) {
  return {
    id: post.id,
    content: post.content,
    likes: post.like_count,
    isLiked: post.is_liked,
    isSolution: post.is_solution,
    author: {
      id: post.author.id,
      name: post.author.name,
      username: `@${post.author.username}`,
      avatar: post.author.avatar_url,
      isVerified: post.author.is_verified,
      postCount: post.author.post_count,
      joinedAt: post.author.joined_at,
    },
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };
}
