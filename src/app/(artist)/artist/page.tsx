'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Music, PlayCircle, Users, DollarSign, Upload, Sparkles, BarChart3,
  Disc3, Calendar, Wallet, Megaphone, ArrowRight, ArrowUpRight, ArrowDownRight,
  Loader2, AlertCircle, BadgeCheck, Headphones, Globe, Smartphone, Monitor,
  Tablet, Heart, MessageSquare, Coins, Activity, ListMusic, Eye, Clock,
  CheckCircle2, FileText, Target, Award, ShieldCheck, UserPlus, Bell,
  Banknote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useArtistDashboard,
  useArtistAnalytics,
  useArtistEarnings,
  useArtistProfile,
  useMyArtistSongs,
  type RecentSong,
  type TopSong,
} from '@/hooks/useArtist';
import { useNotifications, useRealtimeNotifications, type Notification } from '@/hooks/useNotifications';

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toString();
}

function formatUgx(n: number): string {
  return `UGX ${Math.round(n).toLocaleString('en-US')}`;
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 45) return 'just now';
  if (diff < 90) return '1m ago';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 7200) return '1h ago';
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 172800) return 'yesterday';
  if (diff < 604800) return `${Math.round(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

function deltaPct(prev: number, curr: number): number {
  if (prev <= 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

const WITHDRAWAL_THRESHOLD = 50_000;

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ values, accent = '#8b5cf6' }: { values: number[]; accent?: string }) {
  const w = 80, h = 24;
  if (values.length < 2) {
    return <div className="h-6 w-20 rounded bg-muted/40" />;
  }
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  const id = `sparkGrad-${accent.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${id})`} />
      <polyline points={points} fill="none" stroke={accent} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  delta?: number | null;
  spark?: number[];
  accent?: string;
  tint?: string;
}

function KpiCard({ icon: Icon, label, value, sub, delta, spark, accent, tint }: KpiCardProps) {
  const isPositive = (delta ?? 0) >= 0;
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm transition hover:shadow-md',
      tint
    )}>
      <div className="flex items-start justify-between">
        <div className={cn('rounded-xl p-2', accent ?? 'bg-primary/10 text-primary')}>
          <Icon className="h-5 w-5" />
        </div>
        {spark && spark.length > 1 && (
          <Sparkline values={spark} accent={accent?.includes('emerald') ? '#10b981' : accent?.includes('amber') ? '#f59e0b' : accent?.includes('cyan') ? '#06b6d4' : '#8b5cf6'} />
        )}
      </div>
      <p className="mt-3 text-2xl font-bold leading-tight">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {delta !== null && delta !== undefined && Number.isFinite(delta) && Math.abs(delta) >= 0.5 && (
          <span className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
            isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
          )}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Area chart (real SVG) ────────────────────────────────────────────────────

interface ChartPoint { x: number; y: number; date: string; plays: number }

function AreaPlayChart({ data, height = 220 }: { data: Array<{ date: string; plays: number }>; height?: number }) {
  const [tip, setTip] = useState<ChartPoint | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const W = 800, H = height, PX = 48, PY = 12, PB = 26;

  const maxVal = useMemo(() => Math.max(...data.map(d => d.plays), 1), [data]);

  const points: ChartPoint[] = useMemo(() => {
    if (data.length < 2) return [];
    return data.map((d, i) => ({
      x: PX + (i / (data.length - 1)) * (W - PX - 8),
      y: PY + (1 - d.plays / maxVal) * (H - PY - PB),
      date: d.date,
      plays: d.plays,
    }));
  }, [data, maxVal, H]);

  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
        No play data yet — your chart fills as fans listen.
      </div>
    );
  }

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1].x.toFixed(1)} ${H - PB} L ${points[0].x.toFixed(1)} ${H - PB} Z`;
  const xLabelStep = Math.max(1, Math.ceil(points.length / 6));

  return (
    <div ref={containerRef} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="playsGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = PY + t * (H - PY - PB);
          const v = Math.round(maxVal * (1 - t));
          return (
            <g key={t}>
              <line x1={PX} x2={W - 8} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.08" />
              <text x={PX - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">
                {formatNumber(v)}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#playsGrad)" />
        <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          (i % xLabelStep === 0 || i === points.length - 1) && (
            <text key={`xl-${i}`} x={p.x} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          )
        ))}
        {points.map((p, i) => (
          <g key={`hov-${i}`}>
            <rect
              x={p.x - 8}
              y={PY}
              width={16}
              height={H - PY - PB}
              fill="transparent"
              onMouseEnter={() => setTip(p)}
              onMouseLeave={() => setTip(null)}
            />
            {tip?.date === p.date && (
              <>
                <line x1={p.x} x2={p.x} y1={PY} y2={H - PB} stroke="#8b5cf6" strokeOpacity="0.4" strokeDasharray="3 3" />
                <circle cx={p.x} cy={p.y} r={4} fill="#8b5cf6" stroke="#fff" strokeWidth="2" />
              </>
            )}
          </g>
        ))}
      </svg>
      {tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border/60 bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: `${(tip.x / W) * 100}%`,
            top: `${(tip.y / H) * 100}%`,
          }}
        >
          <p className="font-semibold">{formatNumber(tip.plays)} plays</p>
          <p className="text-[10px] text-muted-foreground">
            {new Date(tip.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Earnings Panel ───────────────────────────────────────────────────────────

function WithdrawalRing({ balance }: { balance: number }) {
  const pct = Math.min(1, balance / WITHDRAWAL_THRESHOLD);
  const r = 38, c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={pct >= 1 ? '#10b981' : '#8b5cf6'}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-bold leading-none">{Math.round(pct * 100)}%</p>
        <p className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">to cash out</p>
      </div>
    </div>
  );
}

function EarningsMiniBars({ data }: { data: Array<{ month: string; amount: number }> }) {
  if (!data || data.length === 0) {
    return <div className="h-12 rounded bg-muted/30" />;
  }
  const last = data.slice(-6);
  const max = Math.max(...last.map(d => d.amount), 1);
  return (
    <div className="flex h-12 items-end gap-1">
      {last.map((m, i) => {
        const h = Math.max(8, (m.amount / max) * 100);
        return (
          <div key={i} className="group relative flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-gradient-to-t from-amber-500 to-amber-400 transition group-hover:from-amber-600"
              style={{ height: `${h}%` }}
              title={`${m.month}: ${formatUgx(m.amount)}`}
            />
            <span className="text-[9px] text-muted-foreground">{m.month.slice(0, 3)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Catalog Pipeline ─────────────────────────────────────────────────────────

interface PipelineCounts { total: number; published: number; pending: number; draft: number; rejected?: number }

function CatalogPipeline({ counts }: { counts: PipelineCounts | null }) {
  const stages = [
    { key: 'draft', label: 'Drafts', count: counts?.draft ?? 0, icon: FileText, color: 'text-slate-500', bg: 'bg-slate-500/10', href: '/artist/songs?status=draft' },
    { key: 'pending', label: 'In Review', count: counts?.pending ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', href: '/artist/songs?status=pending' },
    { key: 'published', label: 'Published', count: counts?.published ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', href: '/artist/songs?status=published' },
  ];
  const total = counts?.total ?? 0;

  return (
    <div className="rounded-[24px] border border-border/60 bg-card/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Catalog Pipeline</h2>
          <p className="text-xs text-muted-foreground">{total} song{total === 1 ? '' : 's'} in your studio</p>
        </div>
        <Link href="/artist/upload" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
          <Upload className="h-3.5 w-3.5" /> Upload
        </Link>
      </div>
      <div className="space-y-2.5">
        {stages.map(s => {
          const pct = total > 0 ? (s.count / total) * 100 : 0;
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              href={s.href}
              className="group flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 p-3 transition hover:border-primary/40 hover:bg-background"
            >
              <div className={cn('rounded-lg p-2', s.bg)}>
                <Icon className={cn('h-4 w-4', s.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-sm font-bold">{s.count}</p>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      s.key === 'draft' ? 'bg-slate-400' : s.key === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
      {(counts?.rejected ?? 0) > 0 && (
        <Link href="/artist/songs?status=rejected" className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/15">
          <AlertCircle className="h-3.5 w-3.5" />
          {counts?.rejected} rejected song{counts?.rejected === 1 ? '' : 's'} need attention
        </Link>
      )}
    </div>
  );
}

// ─── Top Songs ────────────────────────────────────────────────────────────────

function TopSongsList({ songs, recentFallback }: { songs: TopSong[] | undefined; recentFallback: RecentSong[] }) {
  const list = songs && songs.length > 0
    ? songs.slice(0, 5).map(s => ({
        id: s.id, title: s.title, artwork: s.artwork,
        plays: s.play_count, downloads: s.download_count,
      }))
    : recentFallback.slice(0, 5).map(s => ({
        id: s.id, title: s.title, artwork: s.artwork,
        plays: s.plays, downloads: s.downloads,
      }));

  return (
    <div className="rounded-[24px] border border-border/60 bg-card/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Top Performing</h2>
          <p className="text-xs text-muted-foreground">By plays in the last 30 days</p>
        </div>
        <Link href="/artist/songs" className="text-xs text-primary hover:underline">View all</Link>
      </div>
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <ListMusic className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No songs yet</p>
          <Link href="/artist/upload" className="mt-1 text-xs text-primary hover:underline">Upload your first track →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((s, i) => (
            <Link
              key={s.id}
              href={`/artist/songs/${s.id}`}
              className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/40 p-2.5 transition hover:border-primary/40 hover:bg-background"
            >
              <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">#{i + 1}</span>
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                {s.artwork ? (
                  <Image src={s.artwork} alt={s.title} fill sizes="44px" className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
                    <Music className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.title}</p>
                <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><PlayCircle className="h-3 w-3" />{formatNumber(s.plays)}</span>
                  <span className="inline-flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatNumber(s.downloads)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Audience Snapshot ────────────────────────────────────────────────────────

const DEVICE_ICONS: Record<string, React.ElementType> = {
  mobile: Smartphone, smartphone: Smartphone, phone: Smartphone, ios: Smartphone, android: Smartphone,
  desktop: Monitor, web: Monitor, browser: Monitor,
  tablet: Tablet, ipad: Tablet,
};

function DeviceMiniDonut({ devices }: { devices: Array<{ device_type: string; count: number }> }) {
  const total = devices.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;
  const r = 30, ir = 18, cx = 40, cy = 40;
  const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];
  let startAngle = -Math.PI / 2;
  const segments = devices.slice(0, 4).map((d, i) => {
    const angle = (d.count / total) * Math.PI * 2;
    const endAngle = startAngle + angle;
    const large = angle > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const xi1 = cx + ir * Math.cos(endAngle), yi1 = cy + ir * Math.sin(endAngle);
    const xi2 = cx + ir * Math.cos(startAngle), yi2 = cy + ir * Math.sin(startAngle);
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${large} 0 ${xi2} ${yi2} Z`;
    const seg = { path, color: colors[i % colors.length], device: d.device_type, pct: (d.count / total) * 100 };
    startAngle = endAngle;
    return seg;
  });
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0">
        {segments.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
      </svg>
      <div className="space-y-1.5">
        {segments.map((s, i) => {
          const Icon = DEVICE_ICONS[s.device.toLowerCase()] ?? Smartphone;
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <Icon className="h-3 w-3 text-muted-foreground" />
              <span className="capitalize">{s.device}</span>
              <span className="text-muted-foreground">{s.pct.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AudienceSnapshot({
  countries, devices, uniqueListeners,
}: {
  countries: Array<{ country: string; count: number }>;
  devices: Array<{ device_type: string; count: number }>;
  uniqueListeners: number;
}) {
  const totalCountry = countries.reduce((s, c) => s + c.count, 0);
  const top = countries.slice(0, 4);

  return (
    <div className="rounded-[24px] border border-border/60 bg-card/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Audience</h2>
          <p className="text-xs text-muted-foreground">{formatNumber(uniqueListeners)} unique listeners</p>
        </div>
        <Link href="/artist/analytics" className="text-xs text-primary hover:underline">Deep dive →</Link>
      </div>
      <div className="space-y-4">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Top countries
          </p>
          {top.length === 0 ? (
            <p className="text-xs text-muted-foreground">No location data yet.</p>
          ) : (
            <div className="space-y-1.5">
              {top.map((c, i) => {
                const pct = totalCountry > 0 ? (c.count / totalCountry) * 100 : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{c.country || 'Unknown'}</span>
                      <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="border-t border-border/40 pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Smartphone className="h-3.5 w-3.5" /> Listening devices
          </p>
          {devices.length === 0 ? (
            <p className="text-xs text-muted-foreground">No device data yet.</p>
          ) : (
            <DeviceMiniDonut devices={devices} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Live Activity Ticker ─────────────────────────────────────────────────────

const NOTIFICATION_ICON: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  tip: { icon: Coins, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  payment: { icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  purchase: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  follow: { icon: UserPlus, color: 'text-cyan-600', bg: 'bg-cyan-500/10' },
  like: { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-500/10' },
  comment: { icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-500/10' },
  song_approved: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  song_pending_review: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  award_nomination: { icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
  referral_reward: { icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-500/10' },
  ticket: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-500/10' },
};

function LiveActivityTicker({
  notifications, isConnected,
}: {
  notifications: Notification[];
  isConnected: boolean;
}) {
  const items = notifications.slice(0, 6);
  return (
    <div className="rounded-[24px] border border-border/60 bg-card/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Live Activity</h2>
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
            isConnected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
          )}>
            <span className={cn(
              'h-1.5 w-1.5 rounded-full',
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'
            )} />
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
        <Link href="/notifications" className="text-xs text-primary hover:underline">All →</Link>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Bell className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No activity yet</p>
          <p className="text-xs text-muted-foreground">Plays, follows, and tips will stream in here in real time.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(n => {
            const meta = NOTIFICATION_ICON[n.type] ?? { icon: Activity, color: 'text-primary', bg: 'bg-primary/10' };
            const Icon = meta.icon;
            const link = n.link ?? n.action_url ?? '/notifications';
            const unread = !n.read_at;
            return (
              <Link
                key={n.id}
                href={link}
                className={cn(
                  'flex items-start gap-3 rounded-xl border border-border/30 bg-background/40 p-2.5 transition hover:border-primary/40 hover:bg-background',
                  unread && 'border-primary/30 bg-primary/5'
                )}
              >
                <div className={cn('rounded-lg p-2', meta.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', meta.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{relativeTime(n.created_at)}</p>
                </div>
                {unread && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Pending Actions strip (fixed schema) ─────────────────────────────────────

interface PendingActionItem { type: string; label: string; count: number; action: string }

const PENDING_ICON: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pending_review: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  draft: { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  rejected: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
};

function PendingActionsStrip({ items }: { items: PendingActionItem[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm text-emerald-700 dark:text-emerald-300">All clear — your studio is up to date.</p>
      </div>
    );
  }
  return (
    <div className="rounded-[24px] border border-border/60 bg-card/90 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Needs your attention</h2>
        <span className="text-xs text-muted-foreground">{items.length} item{items.length === 1 ? '' : 's'}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const meta = PENDING_ICON[item.type] ?? { icon: Activity, color: 'text-primary', bg: 'bg-primary/10' };
          const Icon = meta.icon;
          return (
            <Link
              key={`${item.type}-${i}`}
              href={item.action}
              className="group flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 p-3 transition hover:border-primary/40 hover:bg-background"
            >
              <div className={cn('rounded-lg p-2', meta.bg)}>
                <Icon className={cn('h-4 w-4', meta.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">Tap to resolve</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Profile Completeness Ring ────────────────────────────────────────────────

function useProfileCompleteness() {
  const { data: profile } = useArtistProfile();
  return useMemo(() => {
    if (!profile) return { pct: 0, missing: [] as string[] };
    const checks: Array<[string, boolean]> = [
      ['Avatar', !!profile.avatar],
      ['Banner', !!profile.banner],
      ['Bio', !!(profile.bio && profile.bio.length > 30)],
      ['Country', !!profile.country],
      ['Payout phone', !!profile.payout_phone_number],
      ['Social links', !!(profile.social_links && Object.values(profile.social_links).filter(Boolean).length >= 1)],
    ];
    const done = checks.filter(([, ok]) => ok).length;
    const pct = Math.round((done / checks.length) * 100);
    const missing = checks.filter(([, ok]) => !ok).map(([k]) => k);
    return { pct, missing };
  }, [profile]);
}

function ProfileCompletenessRing({ pct, missing }: { pct: number; missing: string[] }) {
  const r = 26, c = 2 * Math.PI * r;
  const isComplete = pct >= 100;
  return (
    <Link
      href="/artist/profile"
      className={cn(
        'group flex items-center gap-4 rounded-2xl border p-4 transition-all',
        'hover:-translate-y-px hover:shadow-md active:translate-y-0',
        isComplete
          ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10'
          : 'border-primary/25 bg-primary/5 hover:border-primary/50 hover:bg-primary/10'
      )}
    >
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6" />
          <circle
            cx="32" cy="32" r={r} fill="none"
            stroke={isComplete ? '#10b981' : '#8b5cf6'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{pct}%</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold">Profile completeness</p>
          {isComplete && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
        </div>
        {isComplete ? (
          <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">All set — your profile is complete</p>
        ) : (
          <>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Missing: {missing.slice(0, 2).join(', ')}{missing.length > 2 ? ` +${missing.length - 2} more` : ''}
            </p>
            <p className="mt-1 text-[11px] font-medium text-primary">Tap to complete your profile →</p>
          </>
        )}
      </div>
      <div className={cn(
        'rounded-xl p-2 transition-colors',
        isComplete ? 'bg-emerald-500/15 text-emerald-600 group-hover:bg-emerald-500/25' : 'bg-primary/15 text-primary group-hover:bg-primary/25'
      )}>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

const quickActions = [
  { href: '/artist/upload', label: 'Upload Song', description: 'Release new music', icon: Upload, color: 'from-primary to-purple-600' },
  { href: '/artist/wallet', label: 'Wallet', description: 'Balance & top-up', icon: Wallet, color: 'from-green-500 to-emerald-600' },
  { href: '/artist/earnings', label: 'Earnings', description: 'Revenue & withdrawals', icon: DollarSign, color: 'from-amber-500 to-orange-600' },
  { href: '/artist/events', label: 'Events', description: 'Manage your events', icon: Calendar, color: 'from-blue-500 to-cyan-600' },
  { href: '/artist/royalty-splits', label: 'Royalty Splits', description: 'Collaborator shares', icon: Users, color: 'from-pink-500 to-rose-600' },
  { href: '/artist/promotions', label: 'Promotions', description: 'Sell influence services', icon: Megaphone, color: 'from-indigo-500 to-violet-600' },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArtistDashboardPage() {
  const [periodDays, setPeriodDays] = useState<7 | 30 | 90>(30);
  const { data: dashboard, isLoading, error } = useArtistDashboard();
  const { data: analytics } = useArtistAnalytics(periodDays);
  const { data: earnings } = useArtistEarnings();
  const { data: songsData } = useMyArtistSongs({ per_page: 1 });
  const { data: notifData } = useNotifications({ filter: 'all', page: 1 });
  const { isConnected } = useRealtimeNotifications();
  const completeness = useProfileCompleteness();

  const playsSeries = useMemo(() => {
    return analytics?.plays_over_time ?? dashboard?.chart_data ?? [];
  }, [analytics, dashboard]);

  const playsDelta = useMemo(() => {
    if (playsSeries.length < 4) return null;
    const half = Math.floor(playsSeries.length / 2);
    const prev = playsSeries.slice(0, half).reduce((s, d) => s + d.plays, 0);
    const curr = playsSeries.slice(half).reduce((s, d) => s + d.plays, 0);
    return deltaPct(prev, curr);
  }, [playsSeries]);

  const playsSparkValues = useMemo(() => playsSeries.slice(-14).map(d => d.plays), [playsSeries]);
  const totalPlaysFromSeries = useMemo(() => playsSeries.reduce((s, d) => s + d.plays, 0), [playsSeries]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">Failed to load dashboard data</p>
        <button onClick={() => window.location.reload()} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Retry</button>
      </div>
    );
  }

  const recentSongs = dashboard?.recent_songs ?? [];
  const pendingActions = (dashboard?.pending_actions ?? []) as unknown as PendingActionItem[];
  const artist = dashboard?.artist;
  const artistName = artist?.name ?? 'Artist';

  const dashStats = dashboard?.stats ?? [];
  const followersStat = dashStats.find(s => s.label === 'Followers');
  const songsStat = dashStats.find(s => s.label === 'Total Songs');

  const earningsStats = earnings?.stats;
  const monthlyChart = earnings?.monthly_chart ?? earnings?.monthly_trends ?? [];
  const earningsSources = earnings?.earnings_sources ?? [];

  const statusCounts = songsData?.status_counts as PipelineCounts | undefined;

  return (
    <div className="space-y-6">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 p-6 shadow-xl shadow-black/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted">
              {artist?.avatar ? (
                <Image src={artist.avatar} alt={artistName} fill sizes="80px" className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-purple-600">
                  <Music className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-3 w-3" />
                Artist Studio
              </div>
              <div className="mt-2 flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Welcome back, {artistName}</h1>
                {artist?.is_verified && <BadgeCheck className="h-6 w-6 fill-primary text-primary-foreground" />}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className={cn('h-1.5 w-1.5 rounded-full', isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40')} />
                  {isConnected ? 'Realtime connected' : 'Offline'}
                </span>
                {songsStat && <span>· {songsStat.value} song{songsStat.value === '1' ? '' : 's'}</span>}
                {followersStat && <span>· {followersStat.value} fan{followersStat.value === '1' ? '' : 's'}</span>}
              </div>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
            <Link href="/artist/upload" className="group rounded-2xl border border-border/60 bg-background/80 px-4 py-3 transition hover:border-primary/40 hover:bg-background">
              <Upload className="h-5 w-5 text-primary transition group-hover:scale-110" />
              <p className="mt-2 text-sm font-semibold">Upload music</p>
              <p className="text-[11px] text-muted-foreground">Publish a release</p>
            </Link>
            <Link href="/artist/earnings" className="group rounded-2xl border border-border/60 bg-background/80 px-4 py-3 transition hover:border-primary/40 hover:bg-background">
              <DollarSign className="h-5 w-5 text-primary transition group-hover:scale-110" />
              <p className="mt-2 text-sm font-semibold">Earnings</p>
              <p className="text-[11px] text-muted-foreground">Revenue & cashout</p>
            </Link>
            <Link href="/artist/analytics" className="group rounded-2xl border border-border/60 bg-background/80 px-4 py-3 transition hover:border-primary/40 hover:bg-background">
              <BarChart3 className="h-5 w-5 text-primary transition group-hover:scale-110" />
              <p className="mt-2 text-sm font-semibold">Analytics</p>
              <p className="text-[11px] text-muted-foreground">Reach & momentum</p>
            </Link>
          </div>
        </div>

        {/* Profile completeness */}
        <div className="relative mt-5">
          <ProfileCompletenessRing pct={completeness.pct} missing={completeness.missing} />
        </div>
      </section>

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={PlayCircle}
          label={`Plays · last ${periodDays}d`}
          value={formatNumber(totalPlaysFromSeries || analytics?.engagement?.total_plays || 0)}
          delta={playsDelta}
          spark={playsSparkValues}
          accent="bg-primary/10 text-primary"
        />
        <KpiCard
          icon={Headphones}
          label="Unique listeners"
          value={formatNumber(analytics?.engagement?.unique_listeners ?? 0)}
          sub={analytics?.engagement?.avg_listen_time ? `${Math.round(analytics.engagement.avg_listen_time)}s avg listen` : undefined}
          accent="bg-cyan-500/10 text-cyan-600"
        />
        <KpiCard
          icon={Users}
          label="Followers"
          value={followersStat?.value ?? '0'}
          sub="all-time fans"
          accent="bg-pink-500/10 text-pink-600"
        />
        <KpiCard
          icon={DollarSign}
          label="Revenue this month"
          value={earningsStats ? formatUgx(earningsStats.this_month) : '—'}
          delta={earningsStats?.monthly_change ?? null}
          accent="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* ── Plays chart + Earnings panel ─────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-[24px] border border-border/60 bg-card/90 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Plays Over Time</h2>
              <p className="text-xs text-muted-foreground">
                {totalPlaysFromSeries.toLocaleString()} plays in the last {periodDays} days
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/60 p-1">
              {([7, 30, 90] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setPeriodDays(d)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition',
                    periodDays === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <AreaPlayChart data={playsSeries} />
        </section>

        <section className="rounded-[24px] border border-border/60 bg-card/90 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Earnings</h2>
              <p className="text-xs text-muted-foreground">Wallet & withdrawal status</p>
            </div>
            <Link href="/artist/earnings" className="text-xs text-primary hover:underline">Manage →</Link>
          </div>
          {!earningsStats ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Wallet className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Earnings will appear once you have revenue.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <WithdrawalRing balance={earningsStats.balance} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Available balance</p>
                  <p className="truncate text-xl font-bold">{formatUgx(earningsStats.balance)}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {earningsStats.balance >= WITHDRAWAL_THRESHOLD
                      ? 'Ready to withdraw'
                      : `${formatUgx(WITHDRAWAL_THRESHOLD - earningsStats.balance)} to threshold`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border/40 bg-background/60 p-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending</p>
                  <p className="mt-0.5 font-semibold">{formatUgx(earningsStats.pending_earnings)}</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-background/60 p-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">All time</p>
                  <p className="mt-0.5 font-semibold">{formatUgx(earningsStats.total_earnings)}</p>
                </div>
              </div>
              {monthlyChart.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">Last 6 months</p>
                  <EarningsMiniBars data={monthlyChart} />
                </div>
              )}
              {earningsSources.length > 0 && (
                <div className="space-y-1.5 border-t border-border/40 pt-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Revenue mix</p>
                  {earningsSources.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="capitalize">{s.source.replaceAll('_', ' ')}</span>
                      <span className="font-medium">{s.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/artist/earnings"
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
                  earningsStats.balance >= WITHDRAWAL_THRESHOLD
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Banknote className="h-4 w-4" />
                {earningsStats.balance >= WITHDRAWAL_THRESHOLD ? 'Withdraw now' : 'Build to threshold'}
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* ── Catalog Pipeline + Top Songs ─────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CatalogPipeline counts={statusCounts ?? null} />
        <TopSongsList songs={analytics?.top_songs} recentFallback={recentSongs} />
      </div>

      {/* ── Audience + Live Activity ─────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AudienceSnapshot
          countries={analytics?.demographics?.countries ?? []}
          devices={analytics?.demographics?.devices ?? []}
          uniqueListeners={analytics?.engagement?.unique_listeners ?? 0}
        />
        <LiveActivityTicker
          notifications={notifData?.data ?? []}
          isConnected={isConnected}
        />
      </div>

      {/* ── Pending Actions ──────────────────────────────────────────────── */}
      <PendingActionsStrip items={pendingActions} />

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition group-hover:opacity-5', action.color)} />
                <div className={cn('mb-2 w-fit rounded-lg bg-gradient-to-br p-2', action.color)}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
                <ArrowRight className="absolute right-3 top-3 h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
