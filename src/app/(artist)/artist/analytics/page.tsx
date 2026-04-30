'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, PlayCircle, Download,
  Globe, Clock, Loader2, AlertCircle, FileSpreadsheet,
  Music2, DollarSign, Activity, RefreshCw, Headphones,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useArtistAnalytics, useArtistEarnings } from '@/hooks/useArtist';
import { toast } from 'sonner';

// ─── Area Chart ──────────────────────────────────────────────────────────────

interface ChartPoint { x: number; y: number; date: string; plays: number }

function AreaPlayChart({ data }: { data: Array<{ date: string; plays: number }> }) {
  const [tip, setTip] = useState<ChartPoint | null>(null);

  const W = 800, H = 220, PX = 52, PY = 12, PB = 26;

  const points: ChartPoint[] = useMemo(() => {
    if (data.length < 2) return [];
    const max = Math.max(...data.map(d => d.plays), 1);
    return data.map((d, i) => ({
      x: PX + (i / (data.length - 1)) * (W - PX - 8),
      y: PY + (1 - d.plays / max) * (H - PY - PB),
      date: d.date,
      plays: d.plays,
    }));
  }, [data]);

  const maxVal = useMemo(() => Math.max(...data.map(d => d.plays), 1), [data]);

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (points.length < 2) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Not enough data to display
      </div>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${H - PB} L ${PX} ${H - PB} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
    val: Math.round(pct * maxVal),
    y: PY + (1 - pct) * (H - PY - PB),
  }));

  const stepEvery = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data
    .map((d, i) => ({ i, d }))
    .filter(({ i }) => i === 0 || i === data.length - 1 || i % stepEvery === 0);

  const COLOR = '#8b5cf6';

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        onMouseLeave={() => setTip(null)}
      >
        <defs>
          <linearGradient id="playsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR} stopOpacity="0.22" />
            <stop offset="90%" stopColor={COLOR} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={PX} y1={t.y} x2={W - 8} y2={t.y}
              stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"
              strokeDasharray={idx === 0 ? undefined : '4 3'}
            />
            <text x={PX - 6} y={t.y + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.45">
              {formatNum(t.val)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#playsGrad)" />
        <path d={linePath} fill="none" stroke={COLOR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {xLabels.map(({ i, d }) => (
          <text key={i} x={points[i].x} y={H - 8} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.45">
            {formatDate(d.date)}
          </text>
        ))}

        {/* Invisible hover zones */}
        {points.map((p, i) => {
          const prev = points[i - 1];
          const next = points[i + 1];
          const left = prev ? (prev.x + p.x) / 2 : p.x - 10;
          const right = next ? (p.x + next.x) / 2 : p.x + 10;
          return (
            <rect
              key={i}
              x={left} y={0}
              width={right - left} height={H}
              fill="transparent"
              onMouseEnter={() => setTip(p)}
            />
          );
        })}

        {tip && (
          <>
            <line
              x1={tip.x} y1={PY} x2={tip.x} y2={H - PB}
              stroke={COLOR} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="4 3"
            />
            <circle cx={tip.x} cy={tip.y} r="5" fill={COLOR} />
            <circle cx={tip.x} cy={tip.y} r="2.5" fill="white" />
          </>
        )}
      </svg>

      {tip && (
        <div
          className="absolute pointer-events-none z-10 bg-popover border rounded-lg px-3 py-2 shadow-lg text-sm -translate-x-1/2 -translate-y-full -mt-2"
          style={{ left: `${(tip.x / W) * 100}%`, top: `${(tip.y / H) * 100}%` }}
        >
          <p className="font-semibold">{tip.plays.toLocaleString()} plays</p>
          <p className="text-muted-foreground text-xs">
            {new Date(tip.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Device Donut ─────────────────────────────────────────────────────────────

const DONUT_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];

function DeviceDonut({ devices }: { devices: Array<{ device_type: string; count: number }> }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = useMemo(() => devices.reduce((s, d) => s + d.count, 0), [devices]);

  if (total === 0) return <p className="text-sm text-muted-foreground">No device data available</p>;

  const CX = 60, CY = 60, R = 50, IR = 32;
  let angle = -Math.PI / 2;

  const segments = devices.map((d, idx) => {
    const frac = d.count / total;
    const start = angle;
    const end = angle + frac * 2 * Math.PI;
    angle = end;
    const GAP = 0.03;
    const s = start + GAP, e = end - GAP;
    const x1 = CX + R * Math.cos(s), y1 = CY + R * Math.sin(s);
    const x2 = CX + R * Math.cos(e), y2 = CY + R * Math.sin(e);
    const ix1 = CX + IR * Math.cos(e), iy1 = CY + IR * Math.sin(e);
    const ix2 = CX + IR * Math.cos(s), iy2 = CY + IR * Math.sin(s);
    const large = frac > 0.5 ? 1 : 0;
    const path = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix1.toFixed(2)} ${iy1.toFixed(2)} A ${IR} ${IR} 0 ${large} 0 ${ix2.toFixed(2)} ${iy2.toFixed(2)} Z`;
    return { path, color: DONUT_COLORS[idx % DONUT_COLORS.length], ...d, pct: Math.round(frac * 100) };
  });

  const active = hovered ? segments.find(s => s.device_type === hovered) : null;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
        {segments.map(s => (
          <path
            key={s.device_type}
            d={s.path}
            fill={s.color}
            opacity={hovered && hovered !== s.device_type ? 0.35 : 1}
            className="transition-opacity cursor-default"
            onMouseEnter={() => setHovered(s.device_type)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <text x="60" y="55" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">
          {active ? `${active.pct}%` : total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total}
        </text>
        <text x="60" y="70" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.5">
          {active ? active.device_type : 'listeners'}
        </text>
      </svg>
      <div className="space-y-2.5 flex-1">
        {segments.map(s => (
          <div
            key={s.device_type}
            className="flex items-center justify-between cursor-default"
            onMouseEnter={() => setHovered(s.device_type)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-sm capitalize">{s.device_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{s.count.toLocaleString()}</span>
              <span className="text-sm font-medium w-9 text-right">{s.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArtistAnalyticsPage() {
  const [periodDays, setPeriodDays] = useState<7 | 30 | 90 | 365>(30);
  const [exporting, setExporting] = useState(false);

  const { data: analytics, isLoading, error, refetch } = useArtistAnalytics(periodDays);
  const { data: earnings } = useArtistEarnings();

  const playsOverTime = analytics?.plays_over_time ?? [];
  const topSongs = analytics?.top_songs ?? [];
  const countries = analytics?.demographics?.countries ?? [];
  const devices = analytics?.demographics?.devices ?? [];
  const engagement = analytics?.engagement ?? { total_plays: 0, unique_listeners: 0, avg_listen_time: 0 };

  const totalDownloads = useMemo(
    () => topSongs.reduce((s, t) => s + (t.download_count ?? 0), 0),
    [topSongs]
  );
  const maxSongPlays = useMemo(
    () => topSongs.length ? Math.max(...topSongs.map(s => s.play_count)) : 1,
    [topSongs]
  );

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const fmtUGX = (n: number) => {
    if (n >= 1_000_000) return `UGX ${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `UGX ${Math.round(n / 1_000)}K`;
    return `UGX ${n.toLocaleString()}`;
  };

  const fmtDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const exportCSV = () => {
    if (!analytics) return;
    setExporting(true);
    try {
      const rows: string[][] = [
        ['=== Plays Over Time ==='],
        ['Date', 'Plays'],
        ...playsOverTime.map(p => [p.date, String(p.plays)]),
        [],
        ['=== Top Songs ==='],
        ['Title', 'Plays', 'Downloads'],
        ...topSongs.map(s => [s.title, String(s.play_count), String(s.download_count ?? 0)]),
        [],
        ['=== Listeners by Country ==='],
        ['Country', 'Listeners'],
        ...countries.map(c => [c.country, String(c.count)]),
        [],
        ['=== Device Breakdown ==='],
        ['Device', 'Count'],
        ...devices.map(d => [d.device_type, String(d.count)]),
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tesotunes-analytics-${periodDays}d-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Analytics exported');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="font-medium">Failed to load analytics</p>
        <p className="text-sm text-muted-foreground">Check your connection and try again</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Plays',
      value: fmt(engagement.total_plays),
      icon: <PlayCircle className="h-4 w-4" />,
      cls: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30',
    },
    {
      label: 'Unique Listeners',
      value: fmt(engagement.unique_listeners),
      icon: <Headphones className="h-4 w-4" />,
      cls: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Total Downloads',
      value: fmt(totalDownloads),
      icon: <Download className="h-4 w-4" />,
      cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Avg. Listen Time',
      value: fmtDuration(engagement.avg_listen_time),
      icon: <Clock className="h-4 w-4" />,
      cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'This Month',
      value: earnings?.stats?.this_month != null ? fmtUGX(earnings.stats.this_month) : '—',
      subtext: earnings?.stats?.monthly_change != null
        ? `${earnings.stats.monthly_change >= 0 ? '+' : ''}${earnings.stats.monthly_change.toFixed(1)}% vs last month`
        : undefined,
      trend: earnings?.stats?.monthly_change,
      icon: <DollarSign className="h-4 w-4" />,
      cls: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30',
    },
    {
      label: 'Charting Tracks',
      value: String(topSongs.length),
      icon: <Activity className="h-4 w-4" />,
      cls: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30',
    },
  ];

  const countryTotal = countries.reduce((s, c) => s + c.count, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Performance overview · Last {periodDays === 365 ? '12 months' : `${periodDays} days`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-0.5 p-1 bg-muted rounded-lg">
            {([
              { label: '7D', value: 7 },
              { label: '30D', value: 30 },
              { label: '90D', value: 90 },
              { label: '1Y', value: 365 },
            ] as const).map(r => (
              <button
                key={r.label}
                onClick={() => setPeriodDays(r.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                  periodDays === r.value
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            disabled={exporting || !analytics}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', k.cls)}>
              {k.icon}
            </div>
            <p className="text-2xl font-bold tracking-tight leading-none">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-1.5">{k.label}</p>
            {k.subtext && (
              <p className={cn(
                'text-xs mt-1 flex items-center gap-0.5',
                (k.trend ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'
              )}>
                {(k.trend ?? 0) >= 0
                  ? <TrendingUp className="h-3 w-3 shrink-0" />
                  : <TrendingDown className="h-3 w-3 shrink-0" />}
                {k.subtext}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Plays Over Time */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-semibold">Plays Over Time</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {playsOverTime.length > 0 ? `${playsOverTime.length} days of data · hover for details` : 'No data for this period'}
            </p>
          </div>
          {playsOverTime.length > 0 && (
            <div className="text-right">
              <p className="text-lg font-bold">{fmt(engagement.total_plays)}</p>
              <p className="text-xs text-muted-foreground">total plays</p>
            </div>
          )}
        </div>
        <div className="h-60 sm:h-72">
          <AreaPlayChart data={playsOverTime} />
        </div>
      </div>

      {/* Top Songs + Audience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Songs */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Top Songs</h2>
            <span className="text-xs text-muted-foreground">{topSongs.length} tracks</span>
          </div>
          {topSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Music2 className="h-10 w-10 mb-2 opacity-25" />
              <p className="text-sm">No plays yet this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topSongs.slice(0, 8).map((song, idx) => {
                const pct = Math.round((song.play_count / maxSongPlays) * 100);
                const rankCls = ['text-yellow-500', 'text-slate-400', 'text-orange-500'];
                return (
                  <div key={song.id}>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'w-5 text-center text-sm font-bold tabular-nums shrink-0',
                        idx < 3 ? rankCls[idx] : 'text-muted-foreground'
                      )}>
                        {idx + 1}
                      </span>

                      {song.artwork ? (
                        <div className="relative w-9 h-9 rounded overflow-hidden shrink-0 bg-muted">
                          <Image
                            src={song.artwork}
                            alt={song.title}
                            fill
                            className="object-cover"
                            sizes="36px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded bg-muted flex items-center justify-center shrink-0">
                          <Music2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-tight">{song.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <PlayCircle className="h-3 w-3" />
                            {fmt(song.play_count)}
                          </span>
                          {(song.download_count ?? 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {fmt(song.download_count!)}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">{pct}%</span>
                    </div>
                    <div className="mt-1.5 ml-8 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Audience Panel */}
        <div className="rounded-xl border bg-card p-6 space-y-6">
          <div>
            <h2 className="font-semibold mb-4">Device Breakdown</h2>
            <DeviceDonut devices={devices} />
          </div>

          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">Top Regions</h2>
              {countryTotal > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">{fmt(countryTotal)} listeners</span>
              )}
            </div>
            {countries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No geographic data available</p>
            ) : (
              <div className="space-y-2.5">
                {countries.slice(0, 6).map(c => {
                  const pct = countryTotal > 0 ? Math.round((c.count / countryTotal) * 100) : 0;
                  return (
                    <div key={c.country}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{c.country}</span>
                        <span className="text-muted-foreground tabular-nums text-xs">
                          {fmt(c.count)} · {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      {earnings && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Revenue Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Available Balance', value: fmtUGX(earnings.stats.balance), highlight: true },
              { label: 'Pending Earnings', value: fmtUGX(earnings.stats.pending_earnings) },
              { label: 'All-time Earned', value: fmtUGX(earnings.stats.total_earnings) },
              { label: 'This Month', value: fmtUGX(earnings.stats.this_month) },
            ].map(item => (
              <div
                key={item.label}
                className={cn(
                  'p-4 rounded-lg',
                  item.highlight
                    ? 'bg-primary/5 border border-primary/20'
                    : 'bg-muted/50'
                )}
              >
                <p className="text-xs text-muted-foreground mb-1.5">{item.label}</p>
                <p className={cn('font-semibold text-sm', item.highlight && 'text-primary')}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {earnings.earnings_sources && earnings.earnings_sources.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Revenue Sources
              </p>
              {earnings.earnings_sources.map(src => (
                <div key={src.source} className="flex items-center gap-3">
                  <span className="text-sm capitalize w-24 shrink-0">{src.source}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${src.percentage}%` }} />
                  </div>
                  <span className="text-sm font-medium text-right w-28 shrink-0 tabular-nums">
                    {fmtUGX(src.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground w-9 shrink-0 tabular-nums">
                    {src.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
