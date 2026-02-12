'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  MessageSquare,
  Users,
  Pin,
  Lock,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ForumCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  topic_count: number;
  post_count: number;
  is_locked: boolean;
  created_at: string;
}

interface ForumTopic {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  replies: number;
  views: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_flagged: boolean;
  created_at: string;
  last_activity: string;
}

interface ForumStats {
  total_categories: number;
  total_topics: number;
  total_posts: number;
  active_users: number;
  flagged_topics: number;
}

export default function AdminForumsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'categories' | 'topics' | 'moderation'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ['admin', 'forums', 'stats'],
    queryFn: () => apiGet<{ data: ForumStats }>('/api/admin/forums/stats').then(r => r.data),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin', 'forums', 'categories'],
    queryFn: () => apiGet<{ data: ForumCategory[] }>('/api/admin/forums/categories').then(r => r.data),
  });

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['admin', 'forums', 'topics', page, searchQuery],
    queryFn: () => apiGet<{ data: ForumTopic[]; meta: { last_page: number } }>(
      `/admin/forums/topics?page=${page}&search=${searchQuery}`
    ),
  });

  const deleteTopic = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/admin/forums/topics/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forums'] });
      toast.success('Topic deleted');
    },
  });

  const togglePinTopic = useMutation({
    mutationFn: (id: number) => apiPost(`/api/admin/forums/topics/${id}/pin`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forums'] });
      toast.success('Topic pin toggled');
    },
  });

  const toggleLockTopic = useMutation({
    mutationFn: (id: number) => apiPost(`/api/admin/forums/topics/${id}/lock`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forums'] });
      toast.success('Topic lock toggled');
    },
  });

  const statCards = [
    { label: 'Categories', value: stats?.total_categories ?? 0, icon: MessageSquare, color: 'text-blue-500' },
    { label: 'Topics', value: stats?.total_topics ?? 0, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Posts', value: stats?.total_posts ?? 0, icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Active Users', value: stats?.active_users ?? 0, icon: Users, color: 'text-orange-500' },
    { label: 'Flagged', value: stats?.flagged_topics ?? 0, icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Forum Management</h1>
          <p className="text-muted-foreground">Manage categories, topics, and moderation</p>
        </div>
        <Link
          href="/admin/forums/categories/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Category
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn('h-5 w-5', stat.color)} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
        {(['categories', 'topics', 'moderation'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize',
              activeTab === tab ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm"
          placeholder={`Search ${activeTab}...`}
        />
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 text-sm font-medium">Category</th>
                <th className="text-left p-4 text-sm font-medium">Topics</th>
                <th className="text-left p-4 text-sm font-medium">Posts</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-right p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoriesLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      </div>
                    </td>
                    <td className="p-4">{cat.topic_count}</td>
                    <td className="p-4">{cat.post_count}</td>
                    <td className="p-4">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        cat.is_locked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      )}>
                        {cat.is_locked ? 'Locked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No categories found. Create your first forum category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 text-sm font-medium">Topic</th>
                <th className="text-left p-4 text-sm font-medium">Author</th>
                <th className="text-left p-4 text-sm font-medium">Replies</th>
                <th className="text-left p-4 text-sm font-medium">Views</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-right p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topicsLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : topics?.data && topics.data.length > 0 ? (
                topics.data.map((topic) => (
                  <tr key={topic.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {topic.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                        {topic.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        <span className="font-medium">{topic.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{topic.category}</p>
                    </td>
                    <td className="p-4 text-sm">{topic.author}</td>
                    <td className="p-4 text-sm">{topic.replies}</td>
                    <td className="p-4 text-sm">{topic.views}</td>
                    <td className="p-4">
                      {topic.is_flagged ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Flagged
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => togglePinTopic.mutate(topic.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title={topic.is_pinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className={cn('h-4 w-4', topic.is_pinned && 'text-primary')} />
                        </button>
                        <button
                          onClick={() => toggleLockTopic.mutate(topic.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title={topic.is_locked ? 'Unlock' : 'Lock'}
                        >
                          <Lock className={cn('h-4 w-4', topic.is_locked && 'text-orange-500')} />
                        </button>
                        <button
                          onClick={() => deleteTopic.mutate(topic.id)}
                          className="p-2 rounded-lg hover:bg-muted text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No topics found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {topics?.meta && topics.meta.last_page > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {topics.meta.last_page}
              </span>
              <button
                onClick={() => setPage(p => Math.min(topics.meta.last_page, p + 1))}
                disabled={page === topics.meta.last_page}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:bg-muted disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Review flagged content and user reports from the community forums.
          </p>
          <div className="rounded-xl border p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Moderation Queue</h3>
            <p className="text-muted-foreground">
              {stats?.flagged_topics
                ? `${stats.flagged_topics} items need review`
                : 'No items currently flagged for review'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
