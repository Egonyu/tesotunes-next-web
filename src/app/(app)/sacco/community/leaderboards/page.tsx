'use client'

import { useState } from 'react'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSaccoLeaderboards } from '@/hooks/useSaccoAnalytics'
import { SaccoSkeleton, EmptyState } from '@/components/sacco/shared'
import type { Leaderboard, LeaderboardEntry } from '@/types/sacco'

const periods = ['daily', 'weekly', 'monthly', 'all_time'] as const
const categories = ['total_saved', 'goals_completed', 'best_roi', 'fastest_saver'] as const

const categoryLabels: Record<string, string> = {
  total_saved: 'Total Saved',
  goals_completed: 'Goals Completed',
  best_roi: 'Best ROI',
  fastest_saver: 'Fastest Saver',
}

const trendIcon = (trend: string) => {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

export default function LeaderboardsPage() {
  const [period, setPeriod] = useState<string>('weekly')
  const [category, setCategory] = useState<string>('total_saved')

  const { data, isLoading } = useSaccoLeaderboards({ period, category })

  const boards: Leaderboard[] = data ?? []
  const board = boards[0]
  const rankings: LeaderboardEntry[] = board?.rankings ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Leaderboards
        </h2>
        <p className="text-sm text-muted-foreground">See how you rank among fellow artist savers</p>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-1.5 overflow-x-auto">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors',
              period === p ? 'bg-emerald-600 text-white' : 'bg-muted hover:bg-emerald-100 dark:hover:bg-emerald-900/20'
            )}
          >
            {p.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              category === c ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-muted'
            )}
          >
            {categoryLabels[c]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SaccoSkeleton />
      ) : rankings.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-10 w-10 text-amber-400" />}
          title="No rankings yet"
          description="Start saving to appear on the leaderboard!"
        />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          {/* Top 3 Podium */}
          {rankings.length >= 3 && (
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-900/10 dark:via-yellow-900/10 dark:to-amber-900/10 p-6">
              <div className="flex items-end justify-center gap-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold">🥈</div>
                  <p className="text-xs font-medium text-center truncate max-w-20">{rankings[1].artist.name}</p>
                  <p className="text-sm font-bold">{rankings[1].value.toLocaleString()}</p>
                </div>
                {/* 1st Place */}
                <div className="flex flex-col items-center gap-2 -mt-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl font-bold">🥇</div>
                  <p className="text-sm font-semibold text-center truncate max-w-24">{rankings[0].artist.name}</p>
                  <p className="text-lg font-bold text-amber-600">{rankings[0].value.toLocaleString()}</p>
                </div>
                {/* 3rd Place */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-lg font-bold">🥉</div>
                  <p className="text-xs font-medium text-center truncate max-w-20">{rankings[2].artist.name}</p>
                  <p className="text-sm font-bold">{rankings[2].value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="divide-y">
            {rankings.map((entry) => (
              <div key={entry.rank} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors">
                <span className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  entry.rank <= 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-muted text-muted-foreground'
                )}>
                  {entry.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.artist.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="capitalize">{entry.artist.tier}</span>
                    {entry.badge && <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded-full">{entry.badge}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold">{entry.value.toLocaleString()}</span>
                  {trendIcon(entry.trending)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
