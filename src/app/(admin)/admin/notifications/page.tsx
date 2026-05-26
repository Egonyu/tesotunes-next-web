'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'sonner';
import {
  Bell,
  Send,
  Activity,
  CheckCircle2,
  Mail,
  Smartphone,
  AlertTriangle,
  Loader2,
  BarChart3,
  Users,
  Zap,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  total_sent: number;
  total_read: number;
  read_rate: number;
  period_days: number;
}

interface HealthData {
  mail: {
    mailer: string;
    from_address_configured: boolean;
    smtp_host_configured: boolean;
    is_log_mailer: boolean;
  };
  queue: {
    connection: string;
    is_async: boolean;
    pending_jobs: number | null;
    failed_jobs: number | null;
  };
  push: {
    active_device_tokens: number | null;
  };
  notifications: {
    sent_last_24h: number;
    unread_total: number;
    top_types_last_7d: Array<{ type: string; count: number }>;
  };
  checks: {
    mail_ready: boolean;
    queue_ready: boolean;
    push_ready: boolean;
  };
}

interface BroadcastForm {
  title: string;
  message: string;
  action_url: string;
  action_text: string;
  segment: 'all' | 'premium' | 'artists' | 'free';
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = 'text-foreground',
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
      <div className="p-2 rounded-lg bg-muted">
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-xl font-bold', color)}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={cn('inline-block h-2 w-2 rounded-full', ok ? 'bg-green-500' : 'bg-red-500')} />
  );
}

export default function AdminNotificationsPage() {
  const { data: session } = useSession();
  const [broadcastForm, setBroadcastForm] = useState<BroadcastForm>({
    title: '',
    message: '',
    action_url: '',
    action_text: '',
    segment: 'all',
  });

  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-notification-analytics'],
    queryFn: () => apiGet<{ data: AnalyticsData }>('/notifications/analytics?period=30'),
    staleTime: 5 * 60_000,
  });
  const analytics = analyticsRes?.data;

  const { data: healthRes, isLoading: healthLoading } = useQuery({
    queryKey: ['admin-notification-health'],
    queryFn: () => apiGet<{ data: HealthData }>('/notifications/health'),
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
  });
  const health = healthRes?.data;

  const broadcast = useMutation({
    mutationFn: (data: BroadcastForm) => apiPost<{ message: string; data: { recipient_count: number } }>('/notifications/broadcast', data),
    onSuccess: (res) => {
      toast.success(`Broadcast sent to ${res.data?.recipient_count ?? '?'} users`);
      setBroadcastForm({ title: '', message: '', action_url: '', action_text: '', segment: 'all' });
    },
    onError: () => toast.error('Broadcast failed. Please try again.'),
  });

  function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;
    broadcast.mutate(broadcastForm);
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Notification Center</h1>
        <p className="text-sm text-muted-foreground mt-1">System health, delivery analytics, and broadcast tools</p>
      </div>

      {/* Analytics overview */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> 30-Day Analytics
        </h2>
        {analyticsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics…
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Bell} label="Total Sent" value={analytics.total_sent.toLocaleString()} color="text-primary" />
            <StatCard icon={CheckCheck} label="Total Read" value={analytics.total_read.toLocaleString()} color="text-green-500" />
            <StatCard icon={Activity} label="Read Rate" value={`${analytics.read_rate}%`} color={analytics.read_rate >= 50 ? 'text-green-500' : 'text-orange-500'} />
            <StatCard icon={Clock} label="Unread (all time)" value={(health?.notifications.unread_total ?? '—').toLocaleString()} color="text-amber-500" />
          </div>
        ) : null}
      </section>

      {/* System health */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" /> Delivery Health
        </h2>
        {healthLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking health…
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Mail */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4" />
                <span className="font-medium text-sm">Email</span>
                <StatusDot ok={health.checks.mail_ready} />
              </div>
              <dl className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Mailer</dt>
                  <dd className="font-mono">{health.mail.mailer}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>From address</dt>
                  <dd><StatusDot ok={health.mail.from_address_configured} /></dd>
                </div>
                <div className="flex justify-between">
                  <dt>SMTP configured</dt>
                  <dd><StatusDot ok={health.mail.smtp_host_configured} /></dd>
                </div>
                {health.mail.is_log_mailer && (
                  <p className="mt-2 text-amber-600 dark:text-amber-400">⚠ Using log mailer — emails not sent in production</p>
                )}
              </dl>
            </div>

            {/* Queue */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4" />
                <span className="font-medium text-sm">Queue</span>
                <StatusDot ok={health.checks.queue_ready && health.queue.is_async} />
              </div>
              <dl className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Driver</dt>
                  <dd className="font-mono">{health.queue.connection}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Async</dt>
                  <dd><StatusDot ok={health.queue.is_async} /></dd>
                </div>
                {health.queue.pending_jobs !== null && (
                  <div className="flex justify-between">
                    <dt>Pending jobs</dt>
                    <dd>{health.queue.pending_jobs}</dd>
                  </div>
                )}
                {health.queue.failed_jobs !== null && (
                  <div className="flex justify-between">
                    <dt>Failed jobs</dt>
                    <dd className={health.queue.failed_jobs > 0 ? 'text-red-500 font-semibold' : ''}>{health.queue.failed_jobs}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Push */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium text-sm">Push</span>
                <StatusDot ok={health.checks.push_ready} />
              </div>
              <dl className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Active device tokens</dt>
                  <dd className="font-semibold text-foreground">{health.push.active_device_tokens ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Sent last 24h</dt>
                  <dd>{health.notifications.sent_last_24h}</dd>
                </div>
              </dl>
              {!health.checks.push_ready && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  ⚠ No active device tokens — push won't reach users
                </p>
              )}
            </div>
          </div>
        ) : null}
      </section>

      {/* Top notification types */}
      {health?.notifications.top_types_last_7d && health.notifications.top_types_last_7d.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Top Types — Last 7 Days
          </h2>
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Type</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {health.notifications.top_types_last_7d.map(({ type, count }) => (
                  <tr key={type} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{type}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Broadcast tool */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Send className="h-4 w-4" /> Broadcast Announcement
        </h2>
        <form onSubmit={handleBroadcast} className="rounded-xl border bg-card p-5 space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <input
                type="text"
                required
                maxLength={255}
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="TesoTunes update: New features available"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Message *</label>
              <textarea
                required
                maxLength={1000}
                rows={3}
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="We've launched exciting new features for artists…"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{broadcastForm.message.length}/1000</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Segment</label>
              <select
                value={broadcastForm.segment}
                onChange={(e) => setBroadcastForm((f) => ({ ...f, segment: e.target.value as BroadcastForm['segment'] }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All users</option>
                <option value="premium">Premium subscribers</option>
                <option value="artists">Artists only</option>
                <option value="free">Free tier</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Action text (optional)</label>
              <input
                type="text"
                maxLength={100}
                value={broadcastForm.action_text}
                onChange={(e) => setBroadcastForm((f) => ({ ...f, action_text: e.target.value }))}
                placeholder="Learn more"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Action URL (optional)</label>
              <input
                type="url"
                maxLength={500}
                value={broadcastForm.action_url}
                onChange={(e) => setBroadcastForm((f) => ({ ...f, action_url: e.target.value }))}
                placeholder="https://tesotunes.com/..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {broadcast.isError && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Failed to send broadcast. Check queue is running.
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={broadcast.isPending || !broadcastForm.title.trim() || !broadcastForm.message.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {broadcast.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {broadcast.isPending ? 'Sending…' : 'Send broadcast'}
            </button>
            {broadcast.isSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Broadcast sent
              </span>
            )}
          </div>
        </form>

        <p className="mt-2 text-xs text-muted-foreground">
          Broadcasts are queued — delivery depends on queue workers being active.
          System announcements respect users' <code className="bg-muted px-1 rounded">global_mute</code> setting.
        </p>
      </section>
    </div>
  );
}
