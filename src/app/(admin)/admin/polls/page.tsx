'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import {
  Search,
  Plus,
  Loader2,
  Trash2,
  Eye,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PollOption {
  id: number;
  text: string;
  votes: number;
  percentage: number;
}

interface AdminPoll {
  id: number;
  question: string;
  description?: string;
  options: PollOption[];
  total_votes: number;
  category: string;
  status: 'active' | 'ended';
  creator: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
  ends_at: string;
}

interface PollStats {
  total_polls: number;
  active_polls: number;
  ended_polls: number;
  total_votes: number;
  avg_votes_per_poll: number;
}

export default function AdminPollsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'polls' | 'create'>('polls');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin', 'polls', 'stats'],
    queryFn: () =>
      apiGet<{ data: PollStats }>('/admin/polls/stats').then((r) => r.data),
  });

  // Fetch polls
  const { data: pollsData, isLoading } = useQuery({
    queryKey: ['admin', 'polls', page, searchQuery, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '15');
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      return apiGet<{
        data: AdminPoll[];
        meta: { current_page: number; last_page: number; total: number };
      }>(`/admin/polls?${params.toString()}`);
    },
  });

  // Delete poll
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/polls/${id}`),
    onSuccess: () => {
      toast.success('Poll deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
    },
    onError: () => toast.error('Failed to delete poll'),
  });

  // End poll early
  const endPollMutation = useMutation({
    mutationFn: (id: number) =>
      apiPost(`/admin/polls/${id}/end`, {}),
    onSuccess: () => {
      toast.success('Poll ended successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
    },
    onError: () => toast.error('Failed to end poll'),
  });

  const polls = pollsData?.data || [];
  const meta = pollsData?.meta;

  const statCards = [
    {
      label: 'Total Polls',
      value: stats?.total_polls ?? 0,
      icon: BarChart3,
      color: 'text-blue-500',
    },
    {
      label: 'Active',
      value: stats?.active_polls ?? 0,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      label: 'Ended',
      value: stats?.ended_polls ?? 0,
      icon: Clock,
      color: 'text-gray-500',
    },
    {
      label: 'Total Votes',
      value: stats?.total_votes ?? 0,
      icon: Users,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Polls Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and review community polls
          </p>
        </div>
        <button
          onClick={() => setActiveTab(activeTab === 'create' ? 'polls' : 'create')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          {activeTab === 'create' ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              New Poll
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn('h-5 w-5', stat.color)} />
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {activeTab === 'create' ? (
        <CreatePollForm
          onCreated={() => {
            setActiveTab('polls');
            queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
          }}
        />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm"
                placeholder="Search polls..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          {/* Polls Table */}
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">
                    Question
                  </th>
                  <th className="text-left p-4 text-sm font-medium">
                    Category
                  </th>
                  <th className="text-left p-4 text-sm font-medium">
                    Options
                  </th>
                  <th className="text-left p-4 text-sm font-medium">Votes</th>
                  <th className="text-left p-4 text-sm font-medium">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium">
                    Ends At
                  </th>
                  <th className="text-right p-4 text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : polls.length > 0 ? (
                  polls.map((poll) => (
                    <tr
                      key={poll.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium line-clamp-1">
                            {poll.question}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {poll.creator.name}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{poll.category}</td>
                      <td className="p-4 text-sm">
                        {poll.options.length} options
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {(poll.total_votes ?? 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            poll.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          )}
                        >
                          {poll.status === 'active' ? 'Active' : 'Ended'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(poll.ends_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {poll.status === 'active' && (
                            <button
                              onClick={() => endPollMutation.mutate(poll.id)}
                              disabled={endPollMutation.isPending}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                              title="End poll"
                            >
                              <XCircle className="h-4 w-4 text-orange-500" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  'Are you sure you want to delete this poll?'
                                )
                              ) {
                                deleteMutation.mutate(poll.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
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
                    <td
                      colSpan={7}
                      className="p-8 text-center text-muted-foreground"
                    >
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No polls found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {meta.last_page}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(meta.last_page, p + 1))
                }
                disabled={page === meta.last_page}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:bg-muted disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// Create Poll Form
// ============================================================================

function CreatePollForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    question: '',
    description: '',
    options: ['', ''],
    category: 'General',
    ends_at: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      apiPost('/admin/polls', {
        question: data.question,
        description: data.description || undefined,
        options: data.options
          .filter((o) => o.trim())
          .map((text) => ({ text })),
        category: data.category,
        ends_at: data.ends_at
          ? new Date(data.ends_at).toISOString()
          : undefined,
      }),
    onSuccess: () => {
      toast.success('Poll created successfully');
      onCreated();
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create poll';
      toast.error(msg);
    },
  });

  const addOption = () => {
    if (form.options.length < 6) {
      setForm((prev) => ({
        ...prev,
        options: [...prev.options, ''],
      }));
    }
  };

  const removeOption = (index: number) => {
    if (form.options.length > 2) {
      setForm((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? value : o)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = form.options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast.error('At least 2 options are required');
      return;
    }
    if (!form.question.trim()) {
      toast.error('Question is required');
      return;
    }
    if (!form.ends_at) {
      toast.error('End date is required');
      return;
    }
    createMutation.mutate(form);
  };

  const categories = [
    'General',
    'Music',
    'Artists',
    'Events',
    'Features',
    'Community',
  ];

  return (
    <div className="rounded-xl border bg-card p-6 max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Create New Poll</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Question *
          </label>
          <input
            type="text"
            value={form.question}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, question: e.target.value }))
            }
            placeholder="What would you like to ask?"
            className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Description (optional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Add context or details..."
            className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm min-h-[80px] resize-y focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            rows={3}
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Options * (min 2, max 6)
          </label>
          <div className="space-y-2">
            {form.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-6">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
                {form.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 rounded-lg hover:bg-muted text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-sm text-primary hover:underline"
            >
              + Add option
            </button>
          )}
        </div>

        {/* Category & End Date */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              End Date *
            </label>
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ends_at: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm"
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCreated}
            className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create Poll
          </button>
        </div>
      </form>
    </div>
  );
}
