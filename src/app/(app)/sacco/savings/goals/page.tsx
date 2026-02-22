'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useSaccoGoals } from '@/hooks/useSaccoGoals'
import { GoalCard, EmptyState, SaccoSkeleton } from '@/components/sacco/shared'
import type { GoalType, GoalStatus } from '@/types/sacco'

const goalFilters: { label: string; value: GoalStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Paused', value: 'paused' },
]

const typeFilters: { label: string; value: GoalType | 'all'; icon: string }[] = [
  { label: 'All Types', value: 'all', icon: '🎯' },
  { label: 'Music Video', value: 'music_video', icon: '🎬' },
  { label: 'Album', value: 'album_production', icon: '💿' },
  { label: 'Concert', value: 'concert', icon: '🎤' },
  { label: 'Equipment', value: 'equipment', icon: '🎸' },
  { label: 'Tour', value: 'tour', icon: '🚌' },
  { label: 'Custom', value: 'custom', icon: '✨' },
]

export default function SaccoGoalsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: goals, isLoading } = useSaccoGoals({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  })

  if (isLoading) return <SaccoSkeleton />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Savings Goals</h2>
          <p className="text-muted-foreground">Save toward music videos, albums, concerts & more</p>
        </div>
        <Link
          href="/sacco/savings/goals/create"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Goal
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {goalFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                statusFilter === f.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
                typeFilter === f.value
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border'
              )}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      {goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => router.push(`/sacco/savings/goals/${goal.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎯"
          title="No savings goals yet"
          description="Create your first goal to start saving toward your next music production, equipment purchase, or concert!"
          action={{
            label: 'Create Your First Goal',
            href: '/sacco/savings/goals/create',
          }}
        />
      )}
    </div>
  )
}
