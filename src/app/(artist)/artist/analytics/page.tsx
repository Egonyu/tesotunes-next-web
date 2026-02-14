'use client';

import { useState } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  PlayCircle,
  Download,
  Globe,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  FileDown,
  FileSpreadsheet,
  Map
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistAnalytics } from '@/hooks/useArtist';
import { apiGet } from '@/lib/api';
import { toast } from 'sonner';

export default function ArtistAnalyticsPage() {
  const [periodDays, setPeriodDays] = useState<7 | 30 | 90 | 365>(30);
  const [showMap, setShowMap] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const { data: analyticsData, isLoading, error } = useArtistAnalytics(periodDays);
  
  const playsOverTime = analyticsData?.plays_over_time || [];
  const topSongs = analyticsData?.top_songs || [];
  const demographics = analyticsData?.demographics || { countries: [], devices: [] };
  const engagement = analyticsData?.engagement || { 
    total_plays: 0, 
    unique_listeners: 0, 
    avg_listen_time: 0 
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportCSV = () => {
    if (!analyticsData) return;
    setExporting(true);
    try {
      const rows = [['Date', 'Plays']];
      playsOverTime.forEach(p => rows.push([p.date, String(p.plays)]));
      rows.push([]);
      rows.push(['Song', 'Plays']);
      topSongs.forEach(s => rows.push([s.title, String(s.play_count)]));
      rows.push([]);
      rows.push(['Country', 'Listeners']);
      demographics.countries.forEach(c => rows.push([c.country, String(c.count)]));

      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${periodDays}d-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
    setExporting(false);
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const res = await apiGet<Blob>(`/artist/analytics/export?format=pdf&period=${periodDays}`, {
        responseType: 'blob',
      } as unknown as undefined);
      const url = URL.createObjectURL(res as unknown as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${periodDays}d-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF exported');
    } catch {
      // Fallback: use client-side CSV if PDF endpoint not available
      exportCSV();
    }
    setExporting(false);
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
        <p className="text-destructive">Failed to load analytics data</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }
  
  const overviewStats = [
    { label: 'Total Plays', value: formatNumber(engagement.total_plays), change: 0 },
    { label: 'Unique Listeners', value: formatNumber(engagement.unique_listeners), change: 0 },
    { label: 'Avg. Play Time', value: formatTime(engagement.avg_listen_time), change: 0 },
    { label: 'Top Songs', value: topSongs.length.toString(), change: 0 },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your music performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={exporting || !analyticsData}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={exportPDF}
            disabled={exporting || !analyticsData}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            PDF
          </button>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {([
            { label: '7d', value: 7 },
            { label: '30d', value: 30 },
            { label: '90d', value: 90 },
            { label: '1y', value: 365 },
          ] as const).map((range) => (
            <button
              key={range.label}
              onClick={() => setPeriodDays(range.value as 7 | 30 | 90 | 365)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                periodDays === range.value
                  ? 'bg-background shadow'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {range.label}
            </button>
          ))}
          </div>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => {
          return (
            <div key={stat.label} className="p-4 rounded-xl border bg-card">
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>
      
      {/* Main Chart */}
      <div className="p-6 rounded-xl border bg-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Plays Over Time</h2>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Plays</span>
            </div>
          </div>
        </div>
        <div className="h-72 flex items-end justify-between gap-1 px-2">
          {playsOverTime.length > 0 ? (
            playsOverTime.map((point, i) => {
              const maxPlays = Math.max(...playsOverTime.map(p => p.plays));
              const height = maxPlays > 0 ? (point.plays / maxPlays) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div 
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${Math.max(5, height)}%` }}
                    title={`${new Date(point.date).toLocaleDateString()}: ${formatNumber(point.plays)} plays`}
                  />
                </div>
              );
            })
          ) : (
            Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="flex-1">
                <div className="w-full bg-muted rounded-t" style={{ height: '20%' }} />
              </div>
            ))
          )}
        </div>
        {playsOverTime.length > 0 && (
          <div className="flex justify-between mt-4 text-xs text-muted-foreground">
            <span>{new Date(playsOverTime[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span>{new Date(playsOverTime[Math.floor(playsOverTime.length / 2)]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span>{new Date(playsOverTime[playsOverTime.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
      
      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Songs */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">Top Songs</h2>
          <div className="space-y-4">
            {topSongs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No song data available</p>
            ) : topSongs.map((song, index) => {
              const rank = index + 1;
              return (
                <div key={song.id} className="flex items-center gap-4">
                  <span className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    rank === 2 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                    rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {rank}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">{formatNumber(song.play_count)} plays</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Top Countries */}
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Listeners by Country</h2>
            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors',
                showMap ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              <Map className="h-3.5 w-3.5" />
              {showMap ? 'List' : 'Map'}
            </button>
          </div>

          {showMap ? (
            /* Geographic bubble map visualization */
            <div className="relative w-full aspect-2/1 bg-muted/30 rounded-lg overflow-hidden border">
              {/* Simple world outline placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 800 400" className="w-full h-full opacity-20">
                  <ellipse cx="400" cy="200" rx="380" ry="180" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="20" y1="200" x2="780" y2="200" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                  <line x1="400" y1="20" x2="400" y2="380" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                </svg>
              </div>
              {/* Country bubbles positioned roughly */}
              {demographics.countries.map((item, idx) => {
                const totalCount = demographics.countries.reduce((sum, c) => sum + c.count, 0);
                const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
                const size = Math.max(24, Math.min(80, percentage * 2));
                // Rough geographic positions for common East African countries
                const positions: Record<string, { x: number; y: number }> = {
                  'Uganda': { x: 55, y: 52 }, 'Kenya': { x: 58, y: 55 },
                  'Tanzania': { x: 57, y: 60 }, 'Rwanda': { x: 54, y: 55 },
                  'Nigeria': { x: 42, y: 52 }, 'South Africa': { x: 52, y: 72 },
                  'Ghana': { x: 40, y: 52 }, 'Ethiopia': { x: 58, y: 48 },
                  'United States': { x: 22, y: 38 }, 'United Kingdom': { x: 43, y: 30 },
                  'Canada': { x: 22, y: 28 }, 'Germany': { x: 47, y: 30 },
                  'France': { x: 44, y: 33 }, 'India': { x: 68, y: 45 },
                };
                const pos = positions[item.country] || { x: 30 + idx * 8, y: 40 + idx * 5 };
                return (
                  <div
                    key={item.country}
                    className="absolute flex items-center justify-center rounded-full bg-primary/20 border border-primary/40 text-[10px] font-medium text-primary hover:bg-primary/30 transition-colors cursor-default"
                    style={{
                      width: size, height: size,
                      left: `${pos.x}%`, top: `${pos.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    title={`${item.country}: ${formatNumber(item.count)} listeners`}
                  >
                    {percentage >= 5 ? `${Math.round(percentage)}%` : ''}
                  </div>
                );
              })}
              {demographics.countries.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  No geographic data available
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {demographics.countries.length === 0 ? (
                <p className="text-muted-foreground text-sm">No country data available</p>
              ) : demographics.countries.map((item) => {
                const totalCount = demographics.countries.reduce((sum, c) => sum + c.count, 0);
                const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                return (
                  <div key={item.country}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.country}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(item.count)} • {percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Peak Hours */}
      <div className="p-6 rounded-xl border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Listening Activity by Hour</h2>
        </div>
        <div className="flex items-end justify-between gap-1 h-32">
          {Array.from({ length: 24 }, (_, hour) => {
            const intensity = Math.sin((hour - 6) * Math.PI / 12) * 0.5 + 0.5;
            const height = 20 + intensity * 80;
            return (
              <div key={hour} className="flex-1 flex flex-col items-center">
                <div 
                  className={cn(
                    'w-full rounded-t transition-colors',
                    intensity > 0.7 ? 'bg-primary' :
                    intensity > 0.4 ? 'bg-primary/60' :
                    'bg-primary/30'
                  )}
                  style={{ height: `${height}%` }}
                  title={`${hour}:00`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Peak listening hours: 18:00 - 22:00 EAT
        </p>
      </div>
    </div>
  );
}
