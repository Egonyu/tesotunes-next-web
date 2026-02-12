'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import {
  Search,
  Filter,
  AlertTriangle,
  Flag,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Music,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Clock,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Report {
  id: number;
  type: 'content' | 'user' | 'comment' | 'song' | 'bug';
  reason: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reported_by: string;
  reported_item: string;
  created_at: string;
}

interface ReportStats {
  total: number;
  pending: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  dismissed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const typeIcons: Record<string, typeof Flag> = {
  content: Flag,
  user: User,
  comment: MessageSquare,
  song: Music,
  bug: AlertTriangle,
};

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ['admin', 'reports', 'stats'],
    queryFn: () => apiGet<{ data: ReportStats }>('/api/admin/reports/stats').then(r => r.data),
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin', 'reports', page, statusFilter, typeFilter, searchQuery],
    queryFn: () =>
      apiGet<{ data: Report[]; meta: { last_page: number } }>(
        `/admin/reports?page=${page}&status=${statusFilter}&type=${typeFilter}&search=${searchQuery}`
      ),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiPost(`/api/admin/reports/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast.success('Report status updated');
    },
  });

  const statCards = [
    { label: 'Total Reports', value: stats?.total ?? 0, icon: BarChart3, color: 'text-blue-500' },
    { label: 'Pending', value: stats?.pending ?? 0, icon: Clock, color: 'text-yellow-500' },
    { label: 'Reviewing', value: stats?.reviewing ?? 0, icon: Eye, color: 'text-blue-500' },
    { label: 'Resolved', value: stats?.resolved ?? 0, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Dismissed', value: stats?.dismissed ?? 0, icon: XCircle, color: 'text-gray-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reports & Moderation</h1>
        <p className="text-muted-foreground">Review user reports and manage platform content</p>
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm"
            placeholder="Search reports..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border bg-background text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border bg-background text-sm"
        >
          <option value="all">All Types</option>
          <option value="content">Content</option>
          <option value="user">User</option>
          <option value="comment">Comment</option>
          <option value="song">Song</option>
          <option value="bug">Bug</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 text-sm font-medium">Report</th>
              <th className="text-left p-4 text-sm font-medium">Type</th>
              <th className="text-left p-4 text-sm font-medium">Priority</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
              <th className="text-left p-4 text-sm font-medium">Reported By</th>
              <th className="text-left p-4 text-sm font-medium">Date</th>
              <th className="text-right p-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : reports?.data && reports.data.length > 0 ? (
              reports.data.map((report) => {
                const TypeIcon = typeIcons[report.type] || Flag;
                return (
                  <tr key={report.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4">
                      <p className="font-medium">{report.reason}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Re: {report.reported_item}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize">{report.type}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', priorityColors[report.priority])}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', statusColors[report.status])}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{report.reported_by}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {report.status === 'pending' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: report.id, status: 'reviewing' })}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="Start Review"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        {(report.status === 'pending' || report.status === 'reviewing') && (
                          <>
                            <button
                              onClick={() => updateStatus.mutate({ id: report.id, status: 'resolved' })}
                              className="p-2 rounded-lg hover:bg-muted text-green-600 transition-colors"
                              title="Resolve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateStatus.mutate({ id: report.id, status: 'dismissed' })}
                              className="p-2 rounded-lg hover:bg-muted text-gray-500 transition-colors"
                              title="Dismiss"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No reports found</h3>
                  <p className="text-muted-foreground">All clear! No reports match your filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {reports?.meta && reports.meta.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {reports.meta.last_page}
            </span>
            <button
              onClick={() => setPage(p => Math.min(reports.meta.last_page, p + 1))}
              disabled={page === reports.meta.last_page}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:bg-muted disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
