'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { 
  Users,
  Music,
  Disc3,
  ShoppingBag,
  DollarSign,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

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
}

interface RecentActivity {
  songs: Array<{ id: number; title: string; artist?: { name: string }; created_at: string }>;
  albums: Array<{ id: number; title: string; artist?: { name: string }; created_at: string }>;
  users: Array<{ id: number; name: string; email: string; created_at: string }>;
}

function formatNumber(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatCurrency(amount: number | null | undefined, currency = 'UGX'): string {
  return `${currency} ${formatNumber(amount)}`;
}

export default function AdminDashboardPage() {
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => apiGet<{ success: boolean; data: DashboardStats }>('/api/admin/dashboard/stats'),
    refetchInterval: 5 * 60 * 1000, // 5 minutes instead of 1 minute
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'activity'],
    queryFn: () => apiGet<{ success: boolean; data: RecentActivity }>('/api/admin/dashboard/recent-activity'),
    refetchInterval: 2 * 60 * 1000, // 2 minutes instead of 30 seconds
    refetchOnWindowFocus: false,
  });

  const stats = statsData?.data;
  const activity = activityData?.data;

  const statCards = stats ? [
    { 
      label: 'Total Users', 
      value: formatNumber(stats.users?.total), 
      change: stats.users?.change_percentage ?? 0, 
      icon: Users, 
      color: 'bg-blue-500',
      subtext: `${stats.users?.new_today ?? 0} new today`
    },
    { 
      label: 'Total Songs', 
      value: formatNumber(stats.songs?.total), 
      change: stats.songs?.change_percentage ?? 0, 
      icon: Music, 
      color: 'bg-purple-500',
      subtext: `${stats.songs?.pending_review ?? 0} pending review`
    },
    { 
      label: 'Revenue (MTD)', 
      value: formatCurrency(stats.revenue?.this_month, stats.revenue?.currency), 
      change: stats.revenue?.change_percentage ?? 0, 
      icon: DollarSign, 
      color: 'bg-green-500',
      subtext: 'vs last month'
    },
    { 
      label: 'Active Streams', 
      value: formatNumber(stats.activity?.plays_today), 
      change: 0, 
      icon: Play, 
      color: 'bg-orange-500',
      subtext: `${formatNumber(stats.activity?.plays_this_week)} this week`
    },
  ] : [];

  const recentActivityItems = activity ? [
    ...(activity.users || []).map(u => ({
      id: `user-${u.id}`,
      type: 'user' as const,
      message: `New user registered: ${u.name}`,
      time: formatDate(u.created_at),
    })),
    ...(activity.songs || []).map(s => ({
      id: `song-${s.id}`,
      type: 'song' as const,
      message: `New song: "${s.title}" by ${s.artist?.name || 'Unknown'}`,
      time: formatDate(s.created_at),
    })),
    ...(activity.albums || []).map(a => ({
      id: `album-${a.id}`,
      type: 'album' as const,
      message: `New album: "${a.title}" by ${a.artist?.name || 'Unknown'}`,
      time: formatDate(a.created_at),
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10) : [];
  
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (statsError) {
    const errMsg = (statsError as { response?: { status?: number } })?.response?.status === 401
      ? 'You need to be logged in as an admin to view the dashboard.'
      : 'Failed to load dashboard data';
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{errMsg}</p>
        <p className="text-muted-foreground text-sm mt-2">Please check your connection and try again</p>
        <button
          onClick={() => refetchStats()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          
          return (
            <div key={stat.label} className="p-6 rounded-xl border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-2 rounded-lg text-white', stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                {stat.change !== 0 && (
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}>
                    {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {Math.abs(stat.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
            </div>
          );
        })}
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Overview */}
        <div className="lg:col-span-2 p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">Content Overview</h2>
              <p className="text-sm text-muted-foreground">Current content statistics</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{stats?.songs?.published ?? 0}</p>
              <p className="text-sm text-muted-foreground">Published Songs</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{stats?.songs?.pending_review ?? 0}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{stats?.artists?.verified ?? 0}</p>
              <p className="text-sm text-muted-foreground">Verified Artists</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{stats?.albums?.total ?? 0}</p>
              <p className="text-sm text-muted-foreground">Total Albums</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <p className="text-xl font-bold text-blue-600">{stats?.users?.active_users ?? 0}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <p className="text-xl font-bold text-purple-600">{stats?.users?.premium_users ?? 0}</p>
              <p className="text-sm text-muted-foreground">Premium Users</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
              <p className="text-xl font-bold text-green-600">{formatNumber(stats?.activity?.total_downloads ?? 0)}</p>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
            </div>
          </div>
        </div>
        
        {/* Pending Actions */}
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Pending Actions</h2>
          </div>
          <div className="space-y-4">
            <Link href="/admin/songs?status=pending_review" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-purple-500" />
                  <span>Songs pending review</span>
                </div>
                <span className="text-lg font-bold">{stats?.songs?.pending_review ?? 0}</span>
              </div>
            </Link>
            <Link href="/admin/artists?status=pending" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>Artist verifications</span>
                </div>
                <span className="text-lg font-bold">{stats?.artists?.pending_verification ?? 0}</span>
              </div>
            </Link>
            <Link href="/admin/albums" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Disc3 className="h-5 w-5 text-green-500" />
                  <span>Upcoming releases</span>
                </div>
                <span className="text-lg font-bold">{stats?.albums?.upcoming ?? 0}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Activity</h2>
            <button className="p-1 hover:bg-muted rounded">
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          {activityLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivityItems.length > 0 ? recentActivityItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-full',
                    item.type === 'user' && 'bg-blue-100 text-blue-600 dark:bg-blue-950',
                    item.type === 'song' && 'bg-purple-100 text-purple-600 dark:bg-purple-950',
                    item.type === 'album' && 'bg-green-100 text-green-600 dark:bg-green-950'
                  )}>
                    {item.type === 'user' && <Users className="h-4 w-4" />}
                    {item.type === 'song' && <Music className="h-4 w-4" />}
                    {item.type === 'album' && <Disc3 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{item.message}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">No recent activity</p>
              )}
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/users/new"
              className="p-4 rounded-lg border hover:bg-muted transition-colors text-center"
            >
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <span className="text-sm font-medium">Add User</span>
            </Link>
            <Link
              href="/admin/songs/new"
              className="p-4 rounded-lg border hover:bg-muted transition-colors text-center"
            >
              <Music className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <span className="text-sm font-medium">Add Song</span>
            </Link>
            <Link
              href="/admin/albums/new"
              className="p-4 rounded-lg border hover:bg-muted transition-colors text-center"
            >
              <Disc3 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <span className="text-sm font-medium">Add Album</span>
            </Link>
            <Link
              href="/admin/store/products/create"
              className="p-4 rounded-lg border hover:bg-muted transition-colors text-center"
            >
              <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <span className="text-sm font-medium">Add Product</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
