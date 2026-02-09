'use client';

import Link from 'next/link';
import { 
  Music,
  PlayCircle,
  TrendingUp,
  DollarSign,
  Users,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistDashboard } from '@/hooks/useArtist';

const iconMap: Record<string, React.ElementType> = {
  'Total Songs': Music,
  'Total Plays': PlayCircle,
  'Followers': Users,
  'Earnings': DollarSign,
};

export default function ArtistDashboardPage() {
  const { data: dashboard, isLoading, error } = useArtistDashboard();
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">Failed to load dashboard data</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }
  
  const stats = dashboard?.stats || [];
  const recentSongs = dashboard?.recent_songs || [];
  const pendingActions = dashboard?.pending_actions || [];
  const chartData = dashboard?.chart_data || [];
  const artistName = dashboard?.artist?.name || 'Artist';
  
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {artistName}!</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your music</p>
        </div>
        <Link
          href="/artist/upload"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Upload className="h-4 w-4" />
          Upload New Song
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.label] || Music;
          const isPositive = stat.change >= 0;
          
          return (
            <div key={stat.label} className="p-4 rounded-xl border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.period}</p>
            </div>
          );
        })}
      </div>
      
      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plays Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Plays Over Time</h2>
            <select className="text-sm px-3 py-1 border rounded-lg bg-background">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-1">
            {chartData.length > 0 ? (
              chartData.map((point, i) => {
                const maxPlays = Math.max(...chartData.map(p => p.plays));
                const height = maxPlays > 0 ? (point.plays / maxPlays) * 100 : 0;
                return (
                  <div 
                    key={i}
                    className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors cursor-pointer"
                    style={{ height: `${Math.max(5, height)}%` }}
                    title={`${new Date(point.date).toLocaleDateString()}: ${formatNumber(point.plays)} plays`}
                  />
                );
              })
            ) : (
              Array.from({ length: 30 }, (_, i) => (
                <div 
                  key={i}
                  className="flex-1 bg-muted rounded-t"
                  style={{ height: '20%' }}
                />
              ))
            )}
          </div>
          {chartData.length > 0 && (
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{new Date(chartData[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>{new Date(chartData[Math.floor(chartData.length / 2)]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>{new Date(chartData[chartData.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
        
        {/* Pending Actions */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">Pending Actions</h2>
          <div className="space-y-4">
            {pendingActions.map((action) => (
              <div key={action.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{action.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{action.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Top Songs */}
      <div className="p-6 rounded-xl border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Top Performing Songs</h2>
          <Link href="/artist/songs" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">#</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Song</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Plays</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Trend</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Released</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentSongs.map((song, index) => (
                <tr key={song.id} className="hover:bg-muted/50">
                  <td className="py-3 text-muted-foreground">{index + 1}</td>
                  <td className="py-3 font-medium">{song.title}</td>
                  <td className="py-3">{formatNumber(song.plays)}</td>
                  <td className="py-3">
                    <span className={cn(
                      'flex items-center gap-1 text-sm',
                      song.trend >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {song.trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {Math.abs(song.trend)}%
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(song.released).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <Link href={`/artist/songs/${song.id}`} className="p-2 hover:bg-muted rounded-lg inline-block">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
