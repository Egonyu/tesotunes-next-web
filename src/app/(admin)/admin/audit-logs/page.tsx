'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import {
  FileText,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Settings,
  Trash2,
  Edit,
  Plus,
  Eye,
  LogIn,
  LogOut,
  Loader2,
  Calendar,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────
interface AuditLog {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  action: string;
  resource_type: string;
  resource_id: string | number;
  description: string;
  ip_address: string;
  user_agent: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  created_at: string;
}

interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  login: LogIn,
  logout: LogOut,
  settings: Settings,
  permission: Shield,
};

const actionColors: Record<string, string> = {
  create: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  update: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  delete: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  view: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
  login: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  logout: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
};

// ── Component ────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, searchTerm, actionFilter, resourceFilter],
    queryFn: () =>
      apiGet<AuditLogsResponse>('/admin/audit-logs', {
        params: {
          page,
          search: searchTerm || undefined,
          action: actionFilter !== 'all' ? actionFilter : undefined,
          resource_type: resourceFilter !== 'all' ? resourceFilter : undefined,
          per_page: 25,
        },
      }),
  });

  const logs = logsData?.data ?? [];
  const meta = logsData?.meta;

  function getActionIcon(action: string) {
    const normalizedAction = Object.keys(actionIcons).find((k) => action.toLowerCase().includes(k));
    return normalizedAction ? actionIcons[normalizedAction] : FileText;
  }

  function getActionColor(action: string) {
    const normalizedAction = Object.keys(actionColors).find((k) => action.toLowerCase().includes(k));
    return normalizedAction ? actionColors[normalizedAction] : 'text-gray-600 bg-gray-100 dark:bg-gray-800';
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all system activity{meta ? ` — ${meta.total.toLocaleString()} events recorded` : ''}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search user, action, resource..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
        </select>
        <select
          value={resourceFilter}
          onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Resources</option>
          <option value="user">Users</option>
          <option value="song">Songs</option>
          <option value="album">Albums</option>
          <option value="order">Orders</option>
          <option value="event">Events</option>
          <option value="role">Roles</option>
          <option value="setting">Settings</option>
        </select>
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="p-12 rounded-xl border bg-card text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No audit logs found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const Icon = getActionIcon(log.action);
            const colorClass = getActionColor(log.action);
            const isExpanded = expandedLog === log.id;

            return (
              <div key={log.id} className="rounded-xl border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  className="w-full p-4 text-left flex items-center gap-4 hover:bg-muted/50 transition-colors"
                >
                  <div className={cn('p-2 rounded-lg shrink-0', colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{log.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {log.user && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user.name}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-muted text-xs">{log.resource_type}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(log.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(log.created_at)}
                      </span>
                    </div>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium capitalize shrink-0',
                    colorClass
                  )}>
                    {log.action}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t bg-muted/30 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">User</p>
                        <p className="font-medium">{log.user?.name ?? 'System'}</p>
                        <p className="text-xs text-muted-foreground">{log.user?.email ?? ''}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Resource</p>
                        <p className="font-medium">{log.resource_type} #{log.resource_id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">IP Address</p>
                        <p className="font-medium font-mono text-xs">{log.ip_address}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">User Agent</p>
                        <p className="font-medium text-xs truncate" title={log.user_agent}>{log.user_agent}</p>
                      </div>
                    </div>

                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Changes</p>
                        <div className="bg-background rounded-lg border p-3 space-y-2 text-xs font-mono">
                          {Object.entries(log.changes).map(([field, change]) => (
                            <div key={field} className="flex gap-2">
                              <span className="text-muted-foreground">{field}:</span>
                              <span className="text-red-500 line-through">{String(change.old)}</span>
                              <span>→</span>
                              <span className="text-green-600">{String(change.new)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.current_page} of {meta.last_page} ({meta.total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
