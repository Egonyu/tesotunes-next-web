'use client'

import { useState } from 'react'
import { Flame, Users, Clock, Gift, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSaccoChallenges, useJoinChallenge } from '@/hooks/useSaccoAnalytics'
import { SaccoSkeleton, EmptyState } from '@/components/sacco/shared'
import type { Challenge } from '@/types/sacco'

const statusFilters = ['all', 'active', 'completed', 'expired'] as const
const typeFilters = ['all', 'solo', 'community', 'competitive'] as const

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const joinChallenge = useJoinChallenge()
  const joined = challenge.my_progress?.joined
  const progress = challenge.my_progress?.percentage ?? 0
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  const typeColors: Record<string, string> = {
    solo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    community: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    competitive: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  }

  return (
    <div className="rounded-xl border p-5 space-y-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', typeColors[challenge.type] ?? '')}>
              {challenge.type}
            </span>
            {challenge.status !== 'active' && (
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                challenge.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              )}>
                {challenge.status}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold">{challenge.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{challenge.description}</p>
        </div>
        <Flame className="h-5 w-5 text-rose-500 shrink-0" />
      </div>

      {/* Goal */}
      <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Target</span>
          <span className="font-medium">{challenge.goal.target.toLocaleString()} {challenge.goal.metric.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Timeframe</span>
          <span className="font-medium">{challenge.goal.timeframe} days</span>
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center gap-2 text-xs">
        <Gift className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-amber-600 font-medium">{challenge.reward.credits} credits</span>
        {challenge.reward.badge && (
          <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded text-[10px]">
            🏅 {challenge.reward.badge}
          </span>
        )}
        {challenge.reward.exclusive_perks?.length > 0 && (
          <span className="text-[10px] text-muted-foreground">+ {challenge.reward.exclusive_perks.length} perks</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {challenge.participants} participants
        </span>
        {challenge.status === 'active' && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysLeft} days left
          </span>
        )}
      </div>

      {/* Progress (if joined) */}
      {joined && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Your progress</span>
            <span className="font-medium">{challenge.my_progress?.current?.toLocaleString()} / {challenge.goal.target.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                progress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Action */}
      {challenge.status === 'active' && !joined && (
        <button
          onClick={() => joinChallenge.mutate(challenge.id)}
          disabled={joinChallenge.isPending}
          className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {joinChallenge.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join Challenge'}
        </button>
      )}
      {joined && progress >= 100 && (
        <div className="text-center text-xs text-emerald-600 font-medium py-2">✅ Challenge Completed!</div>
      )}
    </div>
  )
}

export default function ChallengesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data, isLoading } = useSaccoChallenges()
  const challenges: Challenge[] = data ?? []

  const filtered = challenges.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (typeFilter !== 'all' && c.type !== typeFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Flame className="h-6 w-6 text-rose-500" />
          Challenges
        </h2>
        <p className="text-sm text-muted-foreground">Complete challenges to earn credits and exclusive rewards</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap',
                statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-muted'
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto sm:ml-auto">
          {typeFilters.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap',
                typeFilter === t ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' : 'bg-muted'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <SaccoSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Flame className="h-10 w-10 text-rose-400" />}
          title="No challenges found"
          description="Check back later for new challenges."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}
    </div>
  )
}
