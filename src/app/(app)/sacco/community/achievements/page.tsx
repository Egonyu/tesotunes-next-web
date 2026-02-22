'use client'

import { useState } from 'react'
import { Medal, Lock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSaccoAchievements, useSaccoBadges } from '@/hooks/useSaccoAnalytics'
import { SaccoSkeleton, EmptyState } from '@/components/sacco/shared'
import type { Achievement, AchievementCategory } from '@/types/sacco'

const categoryFilters: { value: AchievementCategory | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'savings', label: '💰 Savings' },
  { value: 'production', label: '🎬 Production' },
  { value: 'roi', label: '📈 ROI' },
  { value: 'consistency', label: '🔥 Consistency' },
  { value: 'community', label: '👥 Community' },
]

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const unlocked = !!achievement.unlocked_at
  const progressPct = achievement.progress?.percentage ?? 0

  return (
    <div className={cn(
      'rounded-xl border p-4 transition-all',
      unlocked ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'opacity-70'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0',
          unlocked ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-muted'
        )}>
          {unlocked ? achievement.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate">{achievement.title}</p>
            {unlocked && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{achievement.description}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
            <span className="capitalize bg-muted px-1.5 py-0.5 rounded">{achievement.category}</span>
            <span className="font-medium text-amber-600">{achievement.points} pts</span>
            {achievement.reward?.credits > 0 && (
              <span className="font-medium text-emerald-600">+{achievement.reward.credits} credits</span>
            )}
          </div>

          {/* Progress Bar */}
          {!unlocked && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="text-muted-foreground">
                  {achievement.progress?.current ?? 0} / {achievement.progress?.target ?? 0}
                </span>
                <span className="font-medium">{progressPct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}

          {unlocked && achievement.unlocked_at && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AchievementsPage() {
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | ''>('')
  const [showUnlocked, setShowUnlocked] = useState<boolean | null>(null) // null = all

  const { data, isLoading } = useSaccoAchievements()
  const { data: badges } = useSaccoBadges()

  const achievements: Achievement[] = data ?? []
  const badgesList = badges ?? []

  const filtered = achievements.filter((a) => {
    if (categoryFilter && a.category !== categoryFilter) return false
    if (showUnlocked === true && !a.unlocked_at) return false
    if (showUnlocked === false && a.unlocked_at) return false
    return true
  })

  const unlockedCount = achievements.filter((a) => a.unlocked_at).length
  const totalPoints = achievements.filter((a) => a.unlocked_at).reduce((sum, a) => sum + (a.points ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Medal className="h-6 w-6 text-purple-500" />
          Achievements
        </h2>
        <p className="text-sm text-muted-foreground">Track your milestones and earn rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{unlockedCount}</p>
          <p className="text-xs text-muted-foreground">Unlocked</p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold">{achievements.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{totalPoints.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
      </div>

      {/* Badges Showcase */}
      {Array.isArray(badgesList) && badgesList.length > 0 && (
        <div className="rounded-xl border p-5 space-y-3">
          <h3 className="text-sm font-semibold">Your Badges</h3>
          <div className="flex flex-wrap gap-3">
            {(badgesList as Array<{ id: string; name: string; icon: string; unlocked: boolean }>).map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border',
                  badge.unlocked
                    ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                    : 'opacity-40'
                )}
              >
                <span>{badge.icon}</span>
                {badge.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {categoryFilters.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value as AchievementCategory | '')}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                categoryFilter === c.value ? 'bg-emerald-600 text-white' : 'bg-muted'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-auto">
          {[
            { value: null, label: 'All' },
            { value: true, label: 'Unlocked' },
            { value: false, label: 'Locked' },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setShowUnlocked(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium',
                showUnlocked === opt.value ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' : 'bg-muted'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <SaccoSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Medal className="h-10 w-10 text-purple-400" />}
          title="No achievements found"
          description="Adjust your filters or keep saving to unlock achievements."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((a) => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
        </div>
      )}
    </div>
  )
}
