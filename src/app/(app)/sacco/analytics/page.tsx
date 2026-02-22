'use client'

import { TrendingUp, TrendingDown, BarChart3, DollarSign, Music, Film, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductionAnalytics, useProductionForecast } from '@/hooks/useSaccoAnalytics'
import { StatCard, SaccoSkeleton, EmptyState } from '@/components/sacco/shared'
import type { Production } from '@/types/sacco'

function ProductionRow({ production }: { production: Production }) {
  const perf = production.performance
  const roi = perf?.roi?.percentage ?? 0
  const statusColors: Record<string, string> = {
    planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    released: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }

  return (
    <div className="flex items-center gap-4 py-3.5 border-b last:border-0">
      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
        {production.type === 'music_video' ? <Film className="h-4 w-4 text-emerald-600" /> : <Music className="h-4 w-4 text-emerald-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{production.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', statusColors[production.status] ?? '')}>
            {production.status.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-muted-foreground capitalize">{production.type.replace('_', ' ')}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold">{(perf?.revenue?.total ?? 0).toLocaleString()} UGX</p>
        <p className={cn('text-xs font-medium', roi >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
          {roi >= 0 ? '+' : ''}{roi.toFixed(1)}% ROI
        </p>
      </div>
    </div>
  )
}

function RevenueBar({ source, amount, percentage }: { source: string; amount: number; percentage: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="capitalize text-muted-foreground">{source}</span>
        <span className="font-medium">{amount.toLocaleString()} UGX ({percentage}%)</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function ROIChart({ data }: { data: Array<{ month: string; roi: number; revenue: number }> }) {
  if (!data?.length) return null
  const maxRoi = Math.max(...data.map((d) => Math.abs(d.roi)), 1)

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">ROI Over Time</h4>
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => {
          const height = Math.abs(d.roi) / maxRoi * 100
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className={cn('text-[9px] font-medium', d.roi >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {d.roi > 0 && '+'}{d.roi.toFixed(0)}%
              </span>
              <div
                className={cn('w-full rounded-t', d.roi >= 0 ? 'bg-emerald-400' : 'bg-rose-400')}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
              <span className="text-[8px] text-muted-foreground">{d.month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useProductionAnalytics()
  const { data: forecast } = useProductionForecast()

  if (isLoading) return <SaccoSkeleton />

  if (!analytics) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-10 w-10 text-emerald-500" />}
        title="No Production Data"
        description="Start saving and producing to see your analytics here."
      />
    )
  }

  const a = analytics
  const fc = forecast

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Production Analytics</h2>
        <p className="text-sm text-muted-foreground">Track ROI across all your productions</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Productions"
          value={a.total_productions}
          icon={<Film className="h-4 w-4" />}
          color="emerald"
        />
        <StatCard
          title="Total Invested"
          value={`${(a.total_invested ?? 0).toLocaleString()}`}
          subtitle="UGX"
          icon={<DollarSign className="h-4 w-4" />}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`${(a.total_revenue ?? 0).toLocaleString()}`}
          subtitle="UGX"
          icon={<TrendingUp className="h-4 w-4" />}
          color="emerald"
          trend={{ value: a.average_roi, direction: a.average_roi >= 0 ? 'up' : 'down' }}
        />
        <StatCard
          title="Avg ROI"
          value={`${a.average_roi?.toFixed(1) ?? 0}%`}
          icon={<BarChart3 className="h-4 w-4" />}
          color={a.average_roi >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Success Rates */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Break Even', value: a.success_rate?.break_even, color: 'text-blue-600' },
          { label: 'Profitable', value: a.success_rate?.profitable, color: 'text-emerald-600' },
          { label: 'Viral Hit', value: a.success_rate?.viral, color: 'text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4 text-center">
            <p className={cn('text-2xl font-bold', s.color)}>{(s.value ?? 0).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ROI Chart & Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border p-5">
          <ROIChart data={a.roi_over_time ?? []} />
        </div>
        <div className="rounded-xl border p-5 space-y-3">
          <h4 className="text-sm font-semibold">Revenue Breakdown</h4>
          {(a.revenue_breakdown ?? []).map((r) => (
            <RevenueBar key={r.source} source={r.source} amount={r.amount} percentage={r.percentage} />
          ))}
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="rounded-xl border p-5">
        <h4 className="text-sm font-semibold mb-4">Your ROI vs Industry Average</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Music Video', yours: a.your_average?.music_video_roi, industry: a.industry_average?.music_video_roi },
            { label: 'Album', yours: a.your_average?.album_roi, industry: a.industry_average?.album_roi },
            { label: 'Concert', yours: a.your_average?.concert_roi, industry: a.industry_average?.concert_roi },
          ].map((b) => (
            <div key={b.label} className="space-y-2">
              <p className="font-medium text-center">{b.label}</p>
              <div className="flex flex-col items-center gap-1">
                <span className={cn('text-lg font-bold', (b.yours ?? 0) >= (b.industry ?? 0) ? 'text-emerald-600' : 'text-amber-600')}>
                  {(b.yours ?? 0).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs {(b.industry ?? 0).toFixed(1)}% avg</span>
                {(b.yours ?? 0) >= (b.industry ?? 0) ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast */}
      {fc && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-5 space-y-3">
          <h4 className="text-sm font-semibold">Next Production Forecast</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{fc.next_production?.type?.replace('_', ' ') ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. Budget</p>
              <p className="font-medium">{(fc.next_production?.estimated_budget ?? 0).toLocaleString()} UGX</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Projected Revenue</p>
              <p className="font-medium">{(fc.next_production?.projected_revenue ?? 0).toLocaleString()} UGX</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. ROI</p>
              <p className="font-bold text-emerald-600">{(fc.next_production?.estimated_roi ?? 0).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Productions List */}
      <div className="rounded-xl border p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">All Productions</h4>
          <span className="text-xs text-muted-foreground">{a.productions?.length ?? 0} total</span>
        </div>
        {a.productions?.length ? (
          <div className="divide-y-0">
            {a.productions.map((p) => (
              <ProductionRow key={p.id} production={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No productions yet</p>
        )}
      </div>
    </div>
  )
}
