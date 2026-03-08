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
  Activity,
  Server,
  AlertTriangle,
  RefreshCw,
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

interface ApiUsageData {
  total_requests: number;
  requests_today: number;
  avg_response_ms: number;
  error_rate: number;
  by_endpoint: Array<{ endpoint: string; count: number; avg_ms: number; error_count: number }>;
  by_hour: Array<{ hour: number; count: number }>;
  top_users: Array<{ user_id: number; name: string; email: string; request_count: number }>;
}

interface TopUserEntry {
  user_id: number;
  name: string;
  email: string;
  request_count: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Music, Users, DollarSign, TrendingUp,
};

// ── Component ────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'platform' | 'api'>('platform');

  const { data: analyticsData, isLoading, isError: platformError, refetch: refetchPlatform } = useQuery({
    queryKey: ['admin-analytics', timeRange],
    queryFn: () => apiGet<AnalyticsResponse>('/admin/analytics', { params: { range: timeRange } }),
    enabled: activeTab === 'platform',
    retry: 1,
  });

  const { data: apiUsageData, isLoading: apiUsageLoading, isError: apiUsageError, refetch: refetchApiUsage } = useQuery({
    queryKey: ['admin-analytics', 'api-usage', timeRange],
    queryFn: () => apiGet<{ data: ApiUsageData }>('/admin/analytics/api-usage', { params: { range: timeRange } }),
    enabled: activeTab === 'api',
    retry: 1,
  });

  const { data: topUsersData, isLoading: topUsersLoading, isError: topUsersError, refetch: refetchTopUsers } = useQuery({
    queryKey: ['admin-analytics', 'top-users', timeRange],
    queryFn: () => apiGet<{ data: TopUserEntry[] }>('/admin/analytics/top-users', { params: { range: timeRange } }),
    enabled: activeTab === 'api',
    retry: 1,
  });

  const analytics = analyticsData?.data;
  const metrics = analytics?.metrics ?? [];
  const topCountries = analytics?.top_countries ?? [];
  const revenueBreakdown = analytics?.revenue_breakdown ?? [];
  const streamsChart = analytics?.streams_chart ?? [];
  const peakHours = analytics?.peak_hours ?? [];
  const maxStream = Math.max(...streamsChart.map((d) => d.count), 1);

  if (isLoading && activeTab === 'platform') {
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

      {/* Tab navigation */}
      <div className="flex border-b gap-6">
        <button
          onClick={() => setActiveTab('platform')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'platform'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Platform
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'api'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Activity className="h-3.5 w-3.5" />
          API Usage
        </button>
      </div>

      {activeTab === 'platform' && (<>
      {/* Platform Error State */}
      {platformError && (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
          <h3 className="font-semibold text-lg mb-1">Failed to load analytics</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Could not connect to the analytics API. Make sure the backend is running.
          </p>
          <button
            onClick={() => refetchPlatform()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* Metrics */}
      {!platformError && (
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

      )}

      {/* Charts Row */}
      {!platformError && (
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

      )}

      {/* Bottom Row */}
      {!platformError && (
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
    )}
    </>
    )}

    {/* API Usage Tab */}
    {activeTab === 'api' && (
      <ApiUsageTab
        usage={apiUsageData?.data}
        topUsers={topUsersData?.data}
        isLoading={apiUsageLoading || topUsersLoading}
        isError={apiUsageError || topUsersError}
        onRetry={() => { refetchApiUsage(); refetchTopUsers(); }}
      />
    )}
    </div>
  );
}

// ── API Usage Tab ─────────────────────────────────────────────────────
function ApiUsageTab({
  usage,
  topUsers,
  isLoading,
  isError,
  onRetry,
}: {
  usage?: ApiUsageData;
  topUsers?: TopUserEntry[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
        <h3 className="font-semibold text-lg mb-1">Failed to load API usage data</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Could not connect to the API usage endpoints. Make sure the backend is running.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  const maxHourCount = Math.max(...(usage?.by_hour?.map(h => h.count) ?? [1]), 1);
  const maxEndpointCount = Math.max(...(usage?.by_endpoint?.map(e => e.count) ?? [1]), 1);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: (usage?.total_requests ?? 0).toLocaleString(), icon: Activity, color: 'text-blue-500' },
          { label: 'Today', value: (usage?.requests_today ?? 0).toLocaleString(), icon: TrendingUp, color: 'text-green-500' },
          { label: 'Avg Response', value: usage ? `${usage.avg_response_ms}ms` : '—', icon: Server, color: 'text-purple-500' },
          { label: 'Error Rate', value: usage ? `${usage.error_rate.toFixed(2)}%` : '—', icon: AlertTriangle, color: usage && usage.error_rate > 5 ? 'text-red-500' : 'text-orange-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn('h-4 w-4', color)} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Requests by Hour */}
        <div className="p-6 rounded-xl border bg-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Requests by Hour (24h)
          </h3>
          {usage?.by_hour?.length ? (
            <div className="h-40 flex items-end gap-1">
              {usage.by_hour.map((h) => {
                const height = Math.max((h.count / maxHourCount) * 100, 2);
                return (
                  <div
                    key={h.hour}
                    className="flex-1 bg-blue-500/30 hover:bg-blue-500/60 rounded-t transition-colors cursor-default"
                    style={{ height: `${height}%` }}
                    title={`${h.hour}:00 — ${h.count.toLocaleString()} reqs`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No data</div>
          )}
        </div>

        {/* Top Endpoints */}
        <div className="p-6 rounded-xl border bg-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            Top Endpoints
          </h3>
          {usage?.by_endpoint?.length ? (
            <div className="space-y-3">
              {usage.by_endpoint.slice(0, 7).map((ep) => (
                <div key={ep.endpoint}>
                  <div className="flex items-center justify-between mb-0.5 text-xs">
                    <span className="font-mono text-muted-foreground truncate max-w-[60%]">{ep.endpoint}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-muted-foreground">{ep.avg_ms}ms</span>
                      {ep.error_count > 0 && (
                        <span className="text-red-500">{ep.error_count} err</span>
                      )}
                      <span className="font-medium">{ep.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', ep.error_count > 0 ? 'bg-orange-500' : 'bg-primary')}
                      style={{ width: `${(ep.count / maxEndpointCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No endpoint data</p>
          )}
        </div>
      </div>

      {/* Top Users */}
      <div className="p-6 rounded-xl border bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Top API Users
        </h3>
        {topUsers?.length ? (
          <div className="space-y-2">
            {topUsers.slice(0, 10).map((user, i) => (
              <div key={user.user_id} className="flex items-center gap-4 py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <span className="text-sm font-semibold shrink-0">
                  {user.request_count.toLocaleString()} reqs
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No user data available</p>
        )}
      </div>
    </div>
  );
}
