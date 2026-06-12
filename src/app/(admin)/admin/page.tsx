'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiGet } from '@/lib/api';
import AccessNotice from '@/components/auth/AccessNotice';
import { getAdminEntryPath } from '@/lib/admin-access';
import { isModeratorRole } from '@/lib/roles';
import {
  Users, Music, Disc3, ShoppingBag, DollarSign, Play,
  ArrowUpRight, ArrowDownRight, Loader2, AlertTriangle,
  ChevronRight, Award, RefreshCw, Zap, CheckCircle2,
  Radio, TrendingUp, Clock, XCircle, Info,
  LayoutDashboard, Mic2, FileCheck, FileX, FileClock,
  BarChart3, Shield, Sparkles,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStats {
  users: {
    total: number;
    new_today: number;
    new_this_week: number;
    change_percentage: number;
    active_users: number;
    premium_users: number;
  };
  songs: {
    total: number;
    published: number;
    pending_review: number;
    draft: number;
    isrc_assigned: number;
    isrc_ready: number;
    isrc_blocked: number;
    total_plays: number;
    plays_today: number;
    change_percentage: number;
  };
  albums: {
    total: number;
    released: number;
    upcoming: number;
  };
  artists: {
    total: number;
    verified: number;
    pending_verification: number;
  };
  revenue: {
    total: number;
    this_month: number;
    last_month: number;
    change_percentage: number;
    currency: string;
  };
  activity: {
    total_plays: number;
    plays_today: number;
    plays_this_week: number;
    total_downloads: number;
    downloads_today: number;
    downloads_this_week: number;
  };
  stream_financials?: {
    total_streams: number;
    stream_revenue_ugx: number;
    download_revenue_ugx: number;
    combined_artist_revenue_ugx: number;
  };
  sources?: {
    revenue?: Array<{ source: string; transactions: number; total_ugx: number }>;
    streaming?: Array<{ source: string; entries: number; total_ugx: number }>;
  };
  per_artist_song_totals?: Array<{
    artist_id: number;
    artist_name: string;
    song_id: number | null;
    song_title: string;
    total_ugx: number;
    stream_ugx: number;
    download_ugx: number;
    last_30_days_ugx: number;
  }>;
  timeseries_14d?: Array<{
    date: string;
    streams: number;
    gross_revenue_ugx: number;
    artist_revenue_ugx: number;
  }>;
}

interface RecentActivity {
  songs: Array<{ id: number; title: string; artist?: { name: string }; created_at: string }>;
  albums: Array<{ id: number; title: string; artist?: { name: string }; created_at: string }>;
  users: Array<{ id: number; name: string; email: string; created_at: string }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatCurrency(amount: number | null | undefined, currency = 'UGX'): string {
  return `${currency} ${formatNumber(amount)}`;
}

function safeChangePct(pct: number | null | undefined): number {
  if (pct == null || !isFinite(pct) || isNaN(pct)) return 0;
  if (Math.abs(pct) > 999) return 0;
  return pct;
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function getSongLabel(row: { song_title: string; song_id: number | null }): string {
  if (!row.song_id || row.song_title === 'Unknown song' || !row.song_title) return 'Aggregated plays';
  return row.song_title;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChangeBadge({ pct }: { pct: number }) {
  const safe = safeChangePct(pct);
  if (safe === 0) return null;
  const pos = safe > 0;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full',
      pos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400',
    )}>
      {pos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(safe).toFixed(1)}%
    </span>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(1, ...data);
  return (
    <div className="flex items-end gap-px h-6 w-full">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[2px] transition-all"
          style={{ height: `${Math.max(15, Math.round((v / max) * 100))}%`, backgroundColor: color, opacity: 0.5 + (i / data.length) * 0.5 }}
        />
      ))}
    </div>
  );
}

function SvgLineChart({
  series14d,
  maxStreams,
  maxRevenue,
}: {
  series14d: Array<{ date: string; streams: number; gross_revenue_ugx: number }>;
  maxStreams: number;
  maxRevenue: number;
}) {
  if (series14d.length < 2) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
        No trend data yet.
      </div>
    );
  }

  const W = 580, H = 160, PADT = 10, PADB = 24, PADL = 8, PADR = 8;
  const cW = W - PADL - PADR;
  const cH = H - PADT - PADB;
  const n = series14d.length;

  const sx = (i: number) => PADL + (i / (n - 1)) * cW;
  const sy = (v: number, max: number) => PADT + cH - Math.max(0, (v / max)) * cH;

  const mkPath = (vals: number[], max: number) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${sx(i).toFixed(1)} ${sy(v, max).toFixed(1)}`).join(' ');

  const mkArea = (vals: number[], max: number) =>
    mkPath(vals, max) +
    ` L ${sx(n - 1).toFixed(1)} ${(PADT + cH).toFixed(1)} L ${PADL.toFixed(1)} ${(PADT + cH).toFixed(1)} Z`;

  const streamVals = series14d.map((p) => p.streams || 0);
  const revVals = series14d.map((p) => p.gross_revenue_ugx || 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44" preserveAspectRatio="none">
      <defs>
        <linearGradient id="dashStreamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={PADL} y1={PADT + cH * (1 - t)}
          x2={W - PADR} y2={PADT + cH * (1 - t)}
          stroke="currentColor" strokeOpacity="0.06" strokeWidth="1"
        />
      ))}

      {/* Fill areas */}
      <path d={mkArea(streamVals, maxStreams)} fill="url(#dashStreamGrad)" />
      <path d={mkArea(revVals, maxRevenue)} fill="url(#dashRevGrad)" />

      {/* Lines */}
      <path d={mkPath(streamVals, maxStreams)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
      <path d={mkPath(revVals, maxRevenue)} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />

      {/* Dots at peaks */}
      {series14d.map((p, i) => {
        const isStreamPeak = p.streams === maxStreams;
        const isRevPeak = p.gross_revenue_ugx === maxRevenue;
        return (
          <g key={p.date}>
            {isStreamPeak && (
              <circle cx={sx(i)} cy={sy(p.streams, maxStreams)} r="4" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
            )}
            {isRevPeak && (
              <circle cx={sx(i)} cy={sy(p.gross_revenue_ugx, maxRevenue)} r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
            )}
          </g>
        );
      })}

      {/* X-axis labels */}
      {series14d.map((p, i) => {
        if (i % 2 !== 0 && i !== n - 1) return null;
        return (
          <text
            key={p.date}
            x={sx(i)}
            y={H - 4}
            textAnchor="middle"
            fontSize="9"
            fill="currentColor"
            opacity="0.5"
          >
            {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const userRole = session?.user?.role ?? null;
  const userPermissions = session?.user?.permissions ?? [];
  const moderatorEntryPath = getAdminEntryPath(userRole, userPermissions);
  const redirectingModerator = isModeratorRole(userRole) && moderatorEntryPath !== null && moderatorEntryPath !== '/admin';
  const dashboardEnabled = !isModeratorRole(userRole);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (redirectingModerator && moderatorEntryPath) {
      router.replace(moderatorEntryPath);
    }
  }, [moderatorEntryPath, redirectingModerator, router]);

  if (sessionStatus === 'loading' || redirectingModerator) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isModeratorRole(userRole) && moderatorEntryPath === null) {
    return (
      <AccessNotice
        title="No Moderator Workspace Available"
        description="Your account is recognized as a moderator but has no web-accessible admin area. Ask an administrator to assign at least one moderator permission."
        callbackUrl="/admin"
        role={userRole ?? undefined}
        variant="forbidden"
      />
    );
  }

  // ─── Data fetching ────────────────────────────────────────────────────────

  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    enabled: dashboardEnabled,
    queryFn: async () => {
      try {
        const res = await apiGet<{ data: DashboardStats }>('/admin/dashboard/stats?live=1');
        setLastRefreshed(new Date());
        return res;
      } catch {
        const [usersRes, songsRes, artistsRes, albumsRes, artistStatsRes] = await Promise.allSettled([
          apiGet<{ data: unknown[]; meta?: { total: number } }>('/admin/users?per_page=1'),
          apiGet<{ data: unknown[]; meta?: { total: number } }>('/admin/songs?per_page=1'),
          apiGet<{ data: unknown[]; meta?: { total: number } }>('/admin/artists?per_page=1'),
          apiGet<{ data: unknown[]; meta?: { total: number } }>('/admin/albums?per_page=1'),
          apiGet<{ data: { total: number; verified: number; pending_verification: number } }>('/admin/artists/statistics'),
        ]);
        const total = (r: PromiseSettledResult<{ data?: unknown[]; meta?: { total: number } }>) =>
          r.status === 'fulfilled' ? (r.value?.meta?.total ?? r.value?.data?.length ?? 0) : 0;
        const artistStats = artistStatsRes.status === 'fulfilled' ? artistStatsRes.value?.data : null;
        setLastRefreshed(new Date());
        return {
          data: {
            users: { total: total(usersRes), new_today: 0, new_this_week: 0, change_percentage: 0, active_users: 0, premium_users: 0 },
            songs: { total: total(songsRes), published: 0, pending_review: 0, draft: 0, isrc_assigned: 0, isrc_ready: 0, isrc_blocked: 0, total_plays: 0, plays_today: 0, change_percentage: 0 },
            albums: { total: total(albumsRes), released: 0, upcoming: 0 },
            artists: { total: artistStats?.total ?? total(artistsRes), verified: artistStats?.verified ?? 0, pending_verification: artistStats?.pending_verification ?? 0 },
            revenue: { total: 0, this_month: 0, last_month: 0, change_percentage: 0, currency: 'UGX' },
            activity: { total_plays: 0, plays_today: 0, plays_this_week: 0, total_downloads: 0, downloads_today: 0, downloads_this_week: 0 },
            stream_financials: { total_streams: 0, stream_revenue_ugx: 0, download_revenue_ugx: 0, combined_artist_revenue_ugx: 0 },
            sources: { revenue: [], streaming: [] },
            per_artist_song_totals: [],
            timeseries_14d: [],
          } as DashboardStats,
        };
      }
    },
    refetchInterval: 20 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'activity'],
    enabled: dashboardEnabled,
    queryFn: async () => {
      try {
        return await apiGet<{ data: RecentActivity }>('/admin/dashboard/recent-activity');
      } catch {
        const [usersRes, songsRes] = await Promise.allSettled([
          apiGet<{ data: Array<{ id: number; full_name?: string; display_name?: string; username?: string; email: string; created_at: string }> }>('/admin/users?per_page=5&sort=-created_at'),
          apiGet<{ data: Array<{ id: number; title: string; artist?: { name: string }; created_at: string }> }>('/admin/songs?per_page=5&sort=-created_at'),
        ]);
        return {
          data: {
            users: usersRes.status === 'fulfilled'
              ? (usersRes.value?.data ?? []).map((u) => ({ id: u.id, name: u.full_name || u.display_name || u.username || 'User', email: u.email, created_at: u.created_at }))
              : [],
            songs: songsRes.status === 'fulfilled'
              ? (songsRes.value?.data ?? []).map((s) => ({ id: s.id, title: s.title, artist: s.artist, created_at: s.created_at }))
              : [],
            albums: [],
          } as RecentActivity,
        };
      }
    },
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'activity'] }),
    ]);
    setRefreshing(false);
  };

  // ─── Derived data ─────────────────────────────────────────────────────────

  const stats = statsData?.data;
  const activity = activityData?.data;
  const series14d = stats?.timeseries_14d ?? [];
  const maxStreams = Math.max(1, ...series14d.map((p) => p.streams || 0));
  const maxRevenue = Math.max(1, ...series14d.map((p) => p.gross_revenue_ugx || 0));

  const streamsSparkline = series14d.slice(-7).map((p) => p.streams || 0);
  const revenueSparkline = series14d.slice(-7).map((p) => p.gross_revenue_ugx || 0);

  const recentActivityItems = activity ? [
    ...(activity.users || []).map(u => ({
      id: `user-${u.id}`,
      type: 'user' as const,
      label: u.name ?? 'New user',
      sub: u.email,
      rawTime: u.created_at,
      display: formatDate(u.created_at),
    })),
    ...(activity.songs || []).map(s => ({
      id: `song-${s.id}`,
      type: 'song' as const,
      label: s.title,
      sub: `by ${s.artist?.name ?? 'Unknown Artist'}`,
      rawTime: s.created_at,
      display: formatDate(s.created_at),
    })),
    ...(activity.albums || []).map(a => ({
      id: `album-${a.id}`,
      type: 'album' as const,
      label: a.title,
      sub: `Album · ${a.artist?.name ?? 'Unknown Artist'}`,
      rawTime: a.created_at,
      display: formatDate(a.created_at),
    })),
  ].sort((a, b) => new Date(b.rawTime).getTime() - new Date(a.rawTime).getTime()).slice(0, 8) : [];

  const revenueSources = stats?.sources?.revenue ?? [];
  const totalSourceRevenue = revenueSources.reduce((sum, s) => sum + s.total_ugx, 0) || 1;

  const topArtists = [...(stats?.per_artist_song_totals ?? [])]
    .reduce<Array<{ artist_id: number; artist_name: string; total_ugx: number }>>((acc, row) => {
      const existing = acc.find(a => a.artist_id === row.artist_id);
      if (existing) existing.total_ugx += row.total_ugx;
      else acc.push({ artist_id: row.artist_id, artist_name: row.artist_name, total_ugx: row.total_ugx });
      return acc;
    }, [])
    .sort((a, b) => b.total_ugx - a.total_ugx)
    .slice(0, 7);

  const operatorQueue = [
    stats?.songs?.isrc_blocked && stats.songs.isrc_blocked > 0
      ? { urgency: 'critical' as const, icon: XCircle, label: 'ISRC-blocked songs', count: stats.songs.isrc_blocked, href: '/admin/songs?isrc_status=blocked', hint: 'Artists cannot earn distribution revenue' }
      : null,
    stats?.users?.premium_users === 0
      ? { urgency: 'warning' as const, icon: AlertTriangle, label: 'Zero premium subscribers', count: null, href: '/admin/users', hint: 'No subscription revenue yet' }
      : null,
    stats?.songs?.pending_review && stats.songs.pending_review > 0
      ? { urgency: 'warning' as const, icon: AlertTriangle, label: 'Songs pending review', count: stats.songs.pending_review, href: '/admin/songs?status=pending_review', hint: 'Awaiting content moderation' }
      : null,
    stats?.artists?.pending_verification && stats.artists.pending_verification > 0
      ? { urgency: 'warning' as const, icon: AlertTriangle, label: 'Artist verifications', count: stats.artists.pending_verification, href: '/admin/artists?status=pending', hint: 'Pending identity review' }
      : null,
    stats?.songs?.isrc_ready && stats.songs.isrc_ready > 0
      ? { urgency: 'info' as const, icon: Info, label: 'Ready for ISRC', count: stats.songs.isrc_ready, href: '/admin/songs?isrc_status=ready', hint: 'Cleared for global distribution' }
      : null,
    stats?.albums?.upcoming && stats.albums.upcoming > 0
      ? { urgency: 'info' as const, icon: Info, label: 'Upcoming releases', count: stats.albums.upcoming, href: '/admin/albums', hint: 'Scheduled but not yet live' }
      : null,
  ].filter(Boolean) as Array<{
    urgency: 'critical' | 'warning' | 'info';
    icon: React.ElementType;
    label: string;
    count: number | null;
    href: string;
    hint: string;
  }>;

  const hasCritical = operatorQueue.some(q => q.urgency === 'critical');

  const premiumPct = stats?.users?.total ? ((stats.users.premium_users ?? 0) / stats.users.total * 100) : 0;
  const isrcPct = stats?.songs?.total ? ((stats.songs.isrc_assigned ?? 0) / stats.songs.total * 100) : 0;
  const verifiedArtistPct = stats?.artists?.total ? ((stats.artists.verified ?? 0) / stats.artists.total * 100) : 0;

  // ─── Loading / Error ──────────────────────────────────────────────────────

  if (statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading platform data...</p>
      </div>
    );
  }

  if (statsError) {
    const is401 = (statsError as { response?: { status?: number } })?.response?.status === 401;
    return (
      <div className="p-8 text-center space-y-3">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <XCircle className="h-6 w-6 text-red-500" />
        </div>
        <p className="font-semibold">{is401 ? 'Authentication required' : 'Failed to load dashboard'}</p>
        <p className="text-muted-foreground text-sm">{is401 ? 'You must be signed in as an admin.' : 'Check your connection and try again.'}</p>
        <button onClick={() => refetchStats()} className="mt-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
          Retry
        </button>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-12">

      {/* ── Critical Alert Banner ─────────────────────────────────────────── */}
      {hasCritical && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
            <span className="text-sm font-medium">
              {stats?.songs?.isrc_blocked ?? 0} songs are ISRC-blocked — artists cannot earn distribution revenue until resolved.
            </span>
          </div>
          <Link href="/admin/songs?isrc_status=blocked" className="shrink-0 text-xs font-bold underline underline-offset-2 hover:text-red-300 transition-colors">
            Resolve now →
          </Link>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-foreground font-medium">Platform Overview</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {timeAgo(lastRefreshed)} · auto-refreshes every 20s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/analytics"
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </Link>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

        {/* Users */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold tabular-nums mt-0.5">{formatNumber(stats?.users?.total)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stats?.users?.new_today ?? 0} new today</p>
              <ChangeBadge pct={stats?.users?.change_percentage ?? 0} />
            </div>
            <p className="text-xs text-blue-400">{stats?.users?.premium_users ?? 0} premium · {stats?.users?.active_users ?? 0} active</p>
          </div>
        </div>

        {/* Songs */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Songs</p>
              <p className="text-2xl font-bold tabular-nums mt-0.5">{formatNumber(stats?.songs?.total)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-500/10">
              <Music className="h-5 w-5 text-violet-500" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stats?.songs?.published ?? 0} published</p>
              <ChangeBadge pct={stats?.songs?.change_percentage ?? 0} />
            </div>
            <p className="text-xs text-violet-400">{stats?.songs?.pending_review ?? 0} pending · {stats?.songs?.draft ?? 0} drafts</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Revenue (MTD)</p>
              <p className="text-2xl font-bold tabular-nums mt-0.5">{formatCurrency(stats?.revenue?.this_month, stats?.revenue?.currency)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">vs last month</p>
              <ChangeBadge pct={stats?.revenue?.change_percentage ?? 0} />
            </div>
            {revenueSparkline.length > 0 && <MiniSparkline data={revenueSparkline} color="#10b981" />}
          </div>
        </div>

        {/* Streams */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Streams</p>
              <p className="text-2xl font-bold tabular-nums mt-0.5">{formatNumber(stats?.activity?.total_plays)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-500/10">
              <Radio className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">{stats?.activity?.plays_today ?? 0} today · {stats?.activity?.plays_this_week ?? 0} this week</p>
            {streamsSparkline.length > 0 && <MiniSparkline data={streamsSparkline} color="#f97316" />}
          </div>
        </div>

        {/* Artists */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Artists</p>
              <p className="text-2xl font-bold tabular-nums mt-0.5">{formatNumber(stats?.artists?.total)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10">
              <Mic2 className="h-5 w-5 text-sky-500" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{stats?.artists?.verified ?? 0} verified</p>
            <p className="text-xs text-amber-400">{stats?.artists?.pending_verification ?? 0} pending verification</p>
          </div>
        </div>
      </div>

      {/* ── Content Pipeline Status ───────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Content Pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Published', value: stats?.songs?.published ?? 0, icon: FileCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', href: '/admin/songs?status=published' },
            { label: 'Pending Review', value: stats?.songs?.pending_review ?? 0, icon: FileClock, color: 'text-amber-500', bg: 'bg-amber-500/10', href: '/admin/songs?status=pending_review' },
            { label: 'ISRC Assigned', value: stats?.songs?.isrc_assigned ?? 0, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/admin/songs?isrc_status=assigned' },
            { label: 'ISRC Ready', value: stats?.songs?.isrc_ready ?? 0, icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-500/10', href: '/admin/songs?isrc_status=ready' },
            { label: 'ISRC Blocked', value: stats?.songs?.isrc_blocked ?? 0, icon: FileX, color: 'text-red-500', bg: 'bg-red-500/10', href: '/admin/songs?isrc_status=blocked' },
            { label: 'Upcoming Albums', value: stats?.albums?.upcoming ?? 0, icon: Disc3, color: 'text-sky-500', bg: 'bg-sky-500/10', href: '/admin/albums' },
          ].map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-xl border bg-card p-4 flex items-center gap-3 hover:bg-muted transition-colors group"
            >
              <div className={cn('p-2 rounded-lg shrink-0', bg)}>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold tabular-nums leading-tight">{formatNumber(value)}</p>
                <p className="text-xs text-muted-foreground leading-tight truncate">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main Chart + Revenue Breakdown ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* 14-Day Trend Line Chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Streams & Revenue — 14 Days</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total revenue (delivered streams): {formatCurrency(stats?.revenue?.total, stats?.revenue?.currency)}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
                Streams
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                Revenue
              </span>
            </div>
          </div>
          <SvgLineChart series14d={series14d} maxStreams={maxStreams} maxRevenue={maxRevenue} />
        </div>

        {/* Revenue Sources */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Revenue Sources (MTD)</h2>
          {revenueSources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
              <DollarSign className="h-8 w-8 opacity-30" />
              <p className="text-sm">No revenue data yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {revenueSources.slice(0, 5).map((source, idx) => {
                const pct = Math.round((source.total_ugx / totalSourceRevenue) * 100);
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-orange-500', 'bg-sky-500'];
                return (
                  <div key={source.source} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium capitalize">{source.source.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{source.transactions}×</span>
                        <span className="text-xs font-semibold tabular-nums">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', colors[idx % colors.length])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {stats?.stream_financials && (
            <div className="mt-5 pt-4 border-t grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-emerald-500/8 p-3 text-center">
                <p className="text-base font-bold tabular-nums text-emerald-400">
                  {formatCurrency(stats.stream_financials.combined_artist_revenue_ugx)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Artist earnings</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-base font-bold tabular-nums">{formatNumber(stats.stream_financials.total_streams)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total streams</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Three Panels: Queue / Top Earners / Activity ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Operator Queue */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full shrink-0', hasCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-400')} />
            Operator Queue
            {operatorQueue.length > 0 && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">{operatorQueue.length} items</span>
            )}
          </h2>
          {operatorQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-sm font-medium">All clear</p>
              <p className="text-xs text-center">Nothing needs your attention right now.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {operatorQueue.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Icon className={cn(
                        'h-4 w-4 mt-0.5 shrink-0',
                        item.urgency === 'critical' && 'text-red-400',
                        item.urgency === 'warning' && 'text-amber-400',
                        item.urgency === 'info' && 'text-sky-400',
                      )} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.hint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.count !== null && (
                        <span className={cn(
                          'text-sm font-bold tabular-nums px-1.5 py-0.5 rounded-md',
                          item.urgency === 'critical' && 'text-red-400 bg-red-500/10',
                          item.urgency === 'warning' && 'text-amber-400 bg-amber-500/10',
                          item.urgency === 'info' && 'text-sky-400 bg-sky-500/10',
                        )}>
                          {item.count}
                        </span>
                      )}
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Earner Artists */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-400" />
              Top Earners
            </h2>
            <Link href="/admin/artists" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              See all →
            </Link>
          </div>
          {topArtists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <Award className="h-8 w-8 opacity-20" />
              <p className="text-sm">No artist earnings data yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {topArtists.map((artist, i) => {
                const initials = artist.artist_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const avatarColors = [
                  'bg-amber-500/20 text-amber-400',
                  'bg-slate-500/20 text-slate-400',
                  'bg-orange-500/20 text-orange-500',
                  'bg-blue-500/20 text-blue-400',
                  'bg-violet-500/20 text-violet-400',
                  'bg-emerald-500/20 text-emerald-400',
                  'bg-sky-500/20 text-sky-400',
                ];
                const rankColor = i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-500' : 'text-muted-foreground';
                return (
                  <Link
                    key={artist.artist_id}
                    href={`/admin/artists/${artist.artist_id}`}
                    className="flex items-center gap-3 hover:bg-muted rounded-lg p-1.5 -mx-1.5 transition-colors group"
                  >
                    <span className={cn('text-xs font-bold w-4 text-center shrink-0 tabular-nums', rankColor)}>
                      {i + 1}
                    </span>
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold', avatarColors[i % avatarColors.length])}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">{artist.artist_name}</p>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-emerald-400 shrink-0">
                      {formatCurrency(artist.total_ugx)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity (Transactions-style) */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <Link href="/admin/users" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              See all →
            </Link>
          </div>
          {activityLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : recentActivityItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <Play className="h-8 w-8 opacity-20" />
              <p className="text-sm">No recent activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivityItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                    item.type === 'user' && 'bg-blue-500/15 text-blue-400',
                    item.type === 'song' && 'bg-violet-500/15 text-violet-400',
                    item.type === 'album' && 'bg-emerald-500/15 text-emerald-400',
                  )}>
                    {item.type === 'user' && <Users className="h-3.5 w-3.5" />}
                    {item.type === 'song' && <Music className="h-3.5 w-3.5" />}
                    {item.type === 'album' && <Disc3 className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{item.display}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Artist Earnings Table ─────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-sm font-semibold">Per-Artist Earnings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Top 20 artist-song revenue breakdown · live · refreshes every 20s</p>
          </div>
          <Link href="/admin/payments" className="text-xs text-muted-foreground hover:text-foreground transition-colors border rounded-lg px-3 py-1.5 hover:bg-muted">
            All payments →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="py-2.5 px-5 text-left text-xs font-medium text-muted-foreground w-8">#</th>
                <th className="py-2.5 pr-4 text-left text-xs font-medium text-muted-foreground">Artist</th>
                <th className="py-2.5 pr-4 text-left text-xs font-medium text-muted-foreground">Song / Type</th>
                <th className="py-2.5 pr-4 text-right text-xs font-medium text-muted-foreground">Stream</th>
                <th className="py-2.5 pr-4 text-right text-xs font-medium text-muted-foreground">Download</th>
                <th className="py-2.5 pr-4 text-right text-xs font-medium text-muted-foreground">Last 30 Days</th>
                <th className="py-2.5 pr-5 text-right text-xs font-medium text-muted-foreground">Lifetime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(stats?.per_artist_song_totals ?? []).slice(0, 20).map((row, i) => (
                <tr key={`${row.artist_id}-${row.song_id ?? 0}`} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-5 text-xs text-muted-foreground tabular-nums">{i + 1}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/artists/${row.artist_id}`} className="font-medium hover:underline underline-offset-2">
                      {row.artist_name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={cn(!row.song_id && 'text-muted-foreground italic text-xs')}>
                      {getSongLabel(row)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">{formatCurrency(row.stream_ugx)}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">{formatCurrency(row.download_ugx)}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{formatCurrency(row.last_30_days_ugx)}</td>
                  <td className="py-3 pr-5 text-right font-semibold tabular-nums text-emerald-400">{formatCurrency(row.total_ugx)}</td>
                </tr>
              ))}
              {(stats?.per_artist_song_totals ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    No artist revenue data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bottom Row: Platform Health + Quick Actions ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Platform Health */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-sky-400" />
            Platform Health
          </h2>
          <div className="space-y-4">
            {[
              {
                label: 'Premium conversion',
                value: `${premiumPct.toFixed(1)}%`,
                sub: `${stats?.users?.premium_users ?? 0} premium of ${stats?.users?.total ?? 0} users`,
                pct: Math.min(100, premiumPct),
                color: premiumPct > 5 ? 'bg-emerald-500' : premiumPct > 0 ? 'bg-amber-500' : 'bg-red-500',
                status: premiumPct > 5 ? 'good' : premiumPct > 0 ? 'warn' : 'bad',
              },
              {
                label: 'ISRC coverage',
                value: `${isrcPct.toFixed(0)}%`,
                sub: `${stats?.songs?.isrc_assigned ?? 0} assigned · ${stats?.songs?.isrc_blocked ?? 0} blocked`,
                pct: Math.min(100, isrcPct),
                color: (stats?.songs?.isrc_blocked ?? 0) > 0 ? 'bg-red-500' : isrcPct > 0 ? 'bg-emerald-500' : 'bg-muted-foreground',
                status: (stats?.songs?.isrc_blocked ?? 0) > 0 ? 'bad' : isrcPct > 0 ? 'good' : 'warn',
              },
              {
                label: 'Content pipeline',
                value: `${stats?.songs?.published ?? 0} live`,
                sub: `${stats?.songs?.pending_review ?? 0} in review · ${stats?.songs?.draft ?? 0} drafts`,
                pct: stats?.songs?.total ? Math.min(100, ((stats.songs.published ?? 0) / stats.songs.total) * 100) : 0,
                color: (stats?.songs?.pending_review ?? 0) > 5 ? 'bg-amber-500' : 'bg-emerald-500',
                status: (stats?.songs?.pending_review ?? 0) > 5 ? 'warn' : 'good',
              },
              {
                label: 'Verified artists',
                value: `${verifiedArtistPct.toFixed(0)}%`,
                sub: `${stats?.artists?.verified ?? 0} verified · ${stats?.artists?.pending_verification ?? 0} pending`,
                pct: Math.min(100, verifiedArtistPct),
                color: (stats?.artists?.pending_verification ?? 0) > 0 ? 'bg-amber-500' : 'bg-emerald-500',
                status: (stats?.artists?.pending_verification ?? 0) > 0 ? 'warn' : 'good',
              },
              {
                label: 'Downloads',
                value: formatNumber(stats?.activity?.total_downloads),
                sub: `${stats?.activity?.downloads_today ?? 0} today · ${stats?.activity?.downloads_this_week ?? 0} this week`,
                pct: Math.min(100, ((stats?.activity?.downloads_today ?? 0) / Math.max(1, (stats?.activity?.total_downloads ?? 1))) * 100 * 30),
                color: (stats?.activity?.total_downloads ?? 0) > 0 ? 'bg-blue-500' : 'bg-muted-foreground',
                status: (stats?.activity?.total_downloads ?? 0) > 0 ? 'good' : 'warn',
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {row.status === 'good' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    {row.status === 'warn' && <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                    {row.status === 'bad' && <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                    <span className="text-xs font-medium">{row.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold tabular-nums">{row.value}</span>
                    <span className="text-xs text-muted-foreground ml-2">{row.sub}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', row.color)}
                    style={{ width: `${Math.max(2, row.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Secondary Stats */}
        <div className="rounded-xl border bg-card p-5 space-y-5">
          <h2 className="text-sm font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: '/admin/users/new', icon: Users, label: 'Add User', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { href: '/admin/songs/new', icon: Music, label: 'Add Song', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
              { href: '/admin/albums/new', icon: Disc3, label: 'Add Album', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { href: '/admin/store/products/create', icon: ShoppingBag, label: 'Add Product', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className={cn('flex items-center gap-2.5 p-3.5 rounded-xl border transition-all hover:brightness-110 group', color)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">{label}</span>
                <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Albums', value: stats?.albums?.total ?? 0, sub: `${stats?.albums?.released ?? 0} released`, href: '/admin/albums' },
                { label: 'Downloads', value: stats?.activity?.total_downloads ?? 0, sub: `${stats?.activity?.downloads_today ?? 0} today`, href: '/admin/songs' },
                { label: 'Subscribers', value: stats?.users?.premium_users ?? 0, sub: 'premium plans', href: '/admin/subscriptions' },
              ].map(({ label, value, sub, href }) => (
                <Link key={label} href={href} className="text-center p-3 rounded-lg hover:bg-muted transition-colors">
                  <p className="text-xl font-bold tabular-nums">{formatNumber(value)}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
                  <p className="text-xs text-muted-foreground/60">{sub}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Live · refreshes every 20s</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/security" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <Shield className="h-3.5 w-3.5" />
                Security
              </Link>
              <span className="text-muted-foreground/30">·</span>
              <Link href="/admin/audit-logs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Audit logs
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
