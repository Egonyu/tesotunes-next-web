'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import {
  Search,
  Plus,
  Loader2,
  Trash2,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Music,
  Mic2,
  Vote,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { POLL_CATEGORIES, type PollType } from '@/hooks/usePolls';

interface PollOption {
  id: number;
  text: string;
  votes: number;
  percentage: number;
}

interface AdminPoll {
  id: number;
  title: string;
  description?: string;
  poll_type: PollType;
  category?: string;
  credits_reward: number;
  options: PollOption[];
  total_votes: number;
  status: 'active' | 'draft' | 'closed';
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
  starts_at: string;
  ends_at: string;
}

interface PollStats {
  total_polls: number;
  active_polls: number;
  closed_polls: number;
  total_votes: number;
  song_battles: number;
  artist_contests: number;
  recent_polls_30d: number;
}

const TYPE_BADGE: Record<PollType, { label: string; icon: React.ElementType; className: string }> = {
  general:        { label: 'Poll',           icon: Vote,  className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  song_battle:    { label: 'Song Battle',    icon: Music, className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  artist_contest: { label: 'Artist Contest', icon: Mic2,  className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

export default function AdminPollsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'polls' | 'create'>('polls');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ['admin', 'polls', 'stats'],
    queryFn: () =>
      apiGet<{ data: PollStats }>('/admin/polls/stats').then((r) => r.data),
  });

  const { data: pollsData, isLoading } = useQuery({
    queryKey: ['admin', 'polls', page, searchQuery, statusFilter, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '15');
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('poll_type', typeFilter);
      return apiGet<{
        data: AdminPoll[];
        meta: { current_page: number; last_page: number; total: number };
      }>(`/admin/polls?${params.toString()}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/polls/${id}`),
    onSuccess: () => {
      toast.success('Poll deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
    },
    onError: () => toast.error('Failed to delete poll'),
  });

  const endPollMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/admin/polls/${id}/close`, {}),
    onSuccess: () => {
      toast.success('Poll ended');
      queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
    },
    onError: () => toast.error('Failed to end poll'),
  });

  const polls = pollsData?.data || [];
  const meta = pollsData?.meta;

  const statCards = [
    { label: 'Total Polls',      value: stats?.total_polls ?? 0,    icon: BarChart3, color: 'text-blue-500' },
    { label: 'Active',           value: stats?.active_polls ?? 0,   icon: CheckCircle, color: 'text-green-500' },
    { label: 'Song Battles',     value: stats?.song_battles ?? 0,   icon: Music,     color: 'text-orange-500' },
    { label: 'Artist Contests',  value: stats?.artist_contests ?? 0,icon: Mic2,      color: 'text-purple-500' },
    { label: 'Ended',            value: stats?.closed_polls ?? 0,   icon: Clock,     color: 'text-gray-500' },
    { label: 'Total Votes',      value: stats?.total_votes ?? 0,    icon: Users,     color: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Polls Management</h1>
          <p className="text-muted-foreground">Create, manage, and review community polls</p>
        </div>
        <button
          onClick={() => setActiveTab(activeTab === 'create' ? 'polls' : 'create')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          {activeTab === 'create' ? (
            <><X className="h-4 w-4" /> Cancel</>
          ) : (
            <><Plus className="h-4 w-4" /> New Poll</>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
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
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm"
                placeholder="Search polls..."
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="song_battle">Song Battle</option>
              <option value="artist_contest">Artist Contest</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Polls Table */}
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Title</th>
                  <th className="text-left p-4 text-sm font-medium">Type</th>
                  <th className="text-left p-4 text-sm font-medium">Options</th>
                  <th className="text-left p-4 text-sm font-medium">Votes</th>
                  <th className="text-left p-4 text-sm font-medium">Credits</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Ends At</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : polls.length > 0 ? (
                  polls.map((poll) => {
                    const typeMeta = TYPE_BADGE[poll.poll_type] ?? TYPE_BADGE.general;
                    const TypeIcon = typeMeta.icon;
                    return (
                      <tr key={poll.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <p className="font-medium line-clamp-1">{poll.title}</p>
                          <p className="text-xs text-muted-foreground">by {poll.user?.name || 'Unknown'}</p>
                        </td>
                        <td className="p-4">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', typeMeta.className)}>
                            <TypeIcon className="h-3 w-3" />
                            {typeMeta.label}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{poll.options.length}</td>
                        <td className="p-4 text-sm font-medium">{(poll.total_votes ?? 0).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <Coins className="h-3 w-3" />
                            {poll.credits_reward ?? 3}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            poll.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : poll.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          )}>
                            {poll.status === 'active' ? 'Active' : poll.status === 'draft' ? 'Draft' : 'Closed'}
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
                                title="End poll early"
                              >
                                <XCircle className="h-4 w-4 text-orange-500" />
                              </button>
                            )}
                            <button
                              onClick={() => { if (confirm('Delete this poll?')) deleteMutation.mutate(poll.id); }}
                              disabled={deleteMutation.isPending}
                              className="p-2 rounded-lg hover:bg-muted text-destructive transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
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
              <span className="text-sm text-muted-foreground">Page {page} of {meta.last_page}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
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
// Create Poll Form (admin — supports all 3 types)
// ============================================================================

function CreatePollForm({ onCreated }: { onCreated: () => void }) {
  const [pollType, setPollType] = useState<PollType>('general');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    credits_reward: 3,
    ends_at: '',
    allow_multiple_votes: false,
    options: ['', ''],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form & { poll_type: PollType }) =>
      apiPost('/admin/polls', {
        title: data.title,
        description: data.description || undefined,
        poll_type: data.poll_type,
        category: data.category || undefined,
        credits_reward: data.credits_reward,
        options: data.options.filter((o) => o.trim()),
        ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : undefined,
        allow_multiple_votes: data.allow_multiple_votes,
      }),
    onSuccess: () => {
      toast.success('Poll created');
      setForm({ title: '', description: '', category: '', credits_reward: 3, ends_at: '', allow_multiple_votes: false, options: ['', ''] });
      setPollType('general');
      onCreated();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, 'Failed to create poll')),
  });

  const addOption = () => {
    if (form.options.length < 10) setForm((p) => ({ ...p, options: [...p.options, ''] }));
  };
  const removeOption = (i: number) => {
    if (form.options.length > 2) setForm((p) => ({ ...p, options: p.options.filter((_, idx) => idx !== i) }));
  };
  const updateOption = (i: number, val: string) => {
    setForm((p) => ({ ...p, options: p.options.map((o, idx) => (idx === i ? val : o)) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.ends_at) { toast.error('End date is required'); return; }
    if (pollType === 'general' && form.options.filter((o) => o.trim()).length < 2) {
      toast.error('At least 2 options required');
      return;
    }
    createMutation.mutate({ ...form, poll_type: pollType });
  };

  return (
    <div className="rounded-xl border bg-card p-6 max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Create New Poll</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Poll Type */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Poll Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(TYPE_BADGE) as [PollType, (typeof TYPE_BADGE)[PollType]][]).map(([type, meta]) => {
              const Icon = meta.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPollType(type)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-sm font-medium',
                    pollType === type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {pollType !== 'general' && (
          <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            {pollType === 'song_battle'
              ? 'Song battles let you pit tracks against each other. Use the user-facing create form to search and pick songs, or enter option text manually here.'
              : 'Artist contests let fans vote for their favourite artists. Use the user-facing form to search artists directly.'}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Question / Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="What would you like to ask?"
            className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Add context..."
            className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm min-h-18 resize-y focus:ring-2 focus:ring-primary outline-none"
            rows={3}
          />
        </div>

        {/* Category + Credits */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Category (optional)</label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm"
            >
              <option value="">None</option>
              {POLL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Credits Reward</label>
            <select
              value={form.credits_reward}
              onChange={(e) => setForm((p) => ({ ...p, credits_reward: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm"
            >
              {[1, 2, 3, 5, 10, 20].map((n) => (
                <option key={n} value={n}>{n} credits</option>
              ))}
            </select>
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Options * (min 2, max 10)</label>
          <div className="space-y-2">
            {form.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-5">{index + 1}.</span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                {form.options.length > 2 && (
                  <button type="button" onClick={() => removeOption(index)} className="p-2 rounded-lg hover:bg-muted text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.options.length < 10 && (
            <button type="button" onClick={addOption} className="mt-2 text-sm text-primary hover:underline">
              + Add option
            </button>
          )}
        </div>

        {/* End Date & Settings */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">End Date *</label>
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm((p) => ({ ...p, ends_at: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm"
              required
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_multiple_votes}
                onChange={(e) => setForm((p) => ({ ...p, allow_multiple_votes: e.target.checked }))}
                className="rounded border-gray-300"
              />
              Allow multiple votes
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onCreated} className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Poll
          </button>
        </div>
      </form>
    </div>
  );
}
