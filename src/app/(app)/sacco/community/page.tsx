'use client'

import Link from 'next/link'
import { Trophy, Medal, Star, Users, BookOpen, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useSaccoAchievements,
  useSaccoLeaderboards,
  useSaccoChallenges,
  useSuccessStories,
  useSaccoStreak,
} from '@/hooks/useSaccoAnalytics'
import { StreakCounter, AchievementBadge, SaccoSkeleton } from '@/components/sacco/shared'
import type { Achievement, Challenge, SuccessStory } from '@/types/sacco'

function QuickLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-2 p-5 rounded-xl border hover:shadow-md transition-all text-center',
        color
      )}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  )
}

export default function CommunityPage() {
  const { data: achievements, isLoading: loadingAchievements } = useSaccoAchievements()
  const { data: leaderboards, isLoading: loadingLeaderboards } = useSaccoLeaderboards({ period: 'weekly' })
  const { data: challenges, isLoading: loadingChallenges } = useSaccoChallenges()
  const { data: stories, isLoading: loadingStories } = useSuccessStories()
  const { data: streak } = useSaccoStreak()

  const isLoading = loadingAchievements || loadingLeaderboards || loadingChallenges || loadingStories
  if (isLoading) return <SaccoSkeleton />

  const achievementsList: Achievement[] = achievements ?? []
  const leaderboardsList = leaderboards ?? []
  const challengesList: Challenge[] = challenges ?? []
  const storiesList: SuccessStory[] = stories?.data ?? []

  const streakData = streak

  const activeChallenges = challengesList.filter((c) => c.status === 'active')
  const topLeaderboard = leaderboardsList[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community</h2>
          <p className="text-sm text-muted-foreground">Compete, earn, and grow with fellow artists</p>
        </div>
        {streakData && (
          <StreakCounter
            currentStreak={streakData.current_streak ?? 0}
            multiplier={streakData.multiplier ?? 1}
          />
        )}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickLink
          href="/sacco/community/leaderboards"
          icon={<Trophy className="h-6 w-6 text-amber-500" />}
          label="Leaderboards"
          color="hover:border-amber-300"
        />
        <QuickLink
          href="/sacco/community/achievements"
          icon={<Medal className="h-6 w-6 text-purple-500" />}
          label="Achievements"
          color="hover:border-purple-300"
        />
        <QuickLink
          href="/sacco/community/challenges"
          icon={<Flame className="h-6 w-6 text-rose-500" />}
          label="Challenges"
          color="hover:border-rose-300"
        />
        <QuickLink
          href="/sacco/community/stories"
          icon={<BookOpen className="h-6 w-6 text-blue-500" />}
          label="Success Stories"
          color="hover:border-blue-300"
        />
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="rounded-xl border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-500" />
              Active Challenges
            </h3>
            <Link href="/sacco/community/challenges" className="text-xs text-emerald-600 hover:underline">See All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeChallenges.slice(0, 2).map((c) => (
              <div key={c.id} className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {c.participants} joined
                  </span>
                  <span className="text-amber-600 font-medium">{c.reward?.credits} credits</span>
                </div>
                {c.my_progress && c.my_progress.joined && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${c.my_progress.percentage}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Leaderboard Preview */}
      {topLeaderboard?.rankings && topLeaderboard.rankings.length > 0 && (
        <div className="rounded-xl border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Weekly Top Savers
            </h3>
            <Link href="/sacco/community/leaderboards" className="text-xs text-emerald-600 hover:underline">Full Rankings</Link>
          </div>
          <div className="space-y-2">
            {topLeaderboard.rankings.slice(0, 5).map((entry) => (
              <div key={entry.rank} className="flex items-center gap-3 py-2">
                <span className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                  entry.rank === 1 && 'bg-amber-100 text-amber-700',
                  entry.rank === 2 && 'bg-gray-200 text-gray-700',
                  entry.rank === 3 && 'bg-orange-100 text-orange-700',
                  entry.rank > 3 && 'bg-muted text-muted-foreground'
                )}>
                  {entry.rank}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{entry.artist.name}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.artist.tier}</p>
                </div>
                <span className="text-sm font-bold">{entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {Array.isArray(achievementsList) && achievementsList.length > 0 && (
        <div className="rounded-xl border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-500" />
              Recent Achievements
            </h3>
            <Link href="/sacco/community/achievements" className="text-xs text-emerald-600 hover:underline">See All</Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {achievementsList.slice(0, 6).map((a) => (
              <AchievementBadge key={a.id} achievement={a} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Success Stories Preview */}
      {Array.isArray(storiesList) && storiesList.length > 0 && (
        <div className="rounded-xl border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Latest Stories
            </h3>
            <Link href="/sacco/community/stories" className="text-xs text-emerald-600 hover:underline">Read More</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {storiesList.slice(0, 2).map((story) => (
              <div key={story.id} className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium">{story.artist.name}</p>
                <p className="text-xs text-muted-foreground">{story.production.title} · {story.production.type.replace('_', ' ')}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">ROI: {story.metrics.roi}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
