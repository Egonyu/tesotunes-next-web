'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import {
  BarChart3,
  Users,
  Music,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────
interface AnalyticsMetric {
  label: string;
  value: string;
  change: number;
  icon: string;
}

interface CountryData {
  country: string;
  users: number;
  percentage: number;
}

interface RevenueItem {
  source: string;
  amount: number;
  percentage: number;
}

interface StreamsDataPoint {
  date: string;
  count: number;
}

interface PeakHourData {
  hour: number;
  intensity: number;
}

interface AnalyticsData {
  metrics: AnalyticsMetric[];
  top_countries: CountryData[];
  revenue_breakdown: RevenueItem[];
  streams_chart: StreamsDataPoint[];
  peak_hours: PeakHourData[];
}

interface AnalyticsResponse {
  data: AnalyticsData;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Music, Users, DollarSign, TrendingUp,
};

// ── Component ────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics', timeRange],
    queryFn: () => apiGet<AnalyticsResponse>('/admin/analytics', { params: { range: timeRange } }),
  });

  const analytics = analyticsData?.data;
  const metrics = analytics?.metrics ?? [];
  const topCountries = analytics?.top_countries ?? [];
  const revenueBreakdown = analytics?.revenue_breakdown ?? [];
  const streamsChart = analytics?.streams_chart ?? [];
  const peakHours = analytics?.peak_hours ?? [];

  const maxStream = Math.max(...streamsChart.map((d) => d.count), 1);

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
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  timeRange === range
                    ? 'bg-background shadow'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = iconMap[metric.icon] ?? BarChart3;
          const isPositive = metric.change >= 0;
          return (
            <div key={metric.label} className="p-6 rounded-xl border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streams Chart */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">Streams Over Time</h2>
          {streamsChart.length > 0 ? (
            <>
              <div className="h-64 flex items-end justify-between gap-1 px-2">
                {streamsChart.map((point, i) => {
                  const height = (point.count / maxStream) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors cursor-pointer"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${point.date}: ${point.count.toLocaleString()} streams`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{streamsChart[0]?.date}</span>
                <span>{streamsChart[Math.floor(streamsChart.length / 2)]?.date}</span>
                <span>{streamsChart[streamsChart.length - 1]?.date}</span>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">No data available</div>
          )}
        </div>

        {/* Revenue Breakdown */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">Revenue Breakdown</h2>
          {revenueBreakdown.length > 0 ? (
            <div className="space-y-4">
              {revenueBreakdown.map((item) => (
                <div key={item.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.source}</span>
                    <span className="text-sm font-medium">
                      UGX {(item.amount / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">No data available</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Users by Country</h2>
          </div>
          {topCountries.length > 0 ? (
            <div className="space-y-4">
              {topCountries.map((item) => (
                <div key={item.country} className="flex items-center gap-4">
                  <div className="w-24 text-sm">{item.country}</div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-medium">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No data available</div>
          )}
        </div>

        {/* Peak Hours */}
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Peak Activity Hours</h2>
          </div>
          {peakHours.length > 0 ? (
            <>
              <div className="grid grid-cols-6 gap-1">
                {peakHours.map((h) => (
                  <div
                    key={h.hour}
                    className={cn(
                      'h-8 rounded flex items-center justify-center text-xs',
                      h.intensity > 0.7 ? 'bg-primary text-primary-foreground' :
                      h.intensity > 0.4 ? 'bg-primary/50' :
                      'bg-primary/20'
                    )}
                    title={`${h.hour}:00 - ${h.hour + 1}:00`}
                  >
                    {h.hour}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Activity intensity heat map (24h)
              </p>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
