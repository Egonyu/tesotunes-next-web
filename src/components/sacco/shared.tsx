'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ReactNode } from 'react'
import Link from 'next/link'

// ============================================================================
// Stat Card
// ============================================================================

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; direction: 'up' | 'down' | 'stable' }
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose'
  className?: string
}

const colorMap = {
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'emerald', className }: StatCardProps) {
  return (
    <div className={cn('rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-xl font-bold tracking-tight truncate">{value}</p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn('rounded-lg p-2 shrink-0', colorMap[color])}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2.5 flex items-center gap-1 text-[11px]">
          {trend.direction === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
          {trend.direction === 'down' && <TrendingDown className="h-3 w-3 text-rose-500" />}
          {trend.direction === 'stable' && <Minus className="h-3 w-3 text-gray-400" />}
          <span className={cn(
            'font-medium',
            trend.direction === 'up' && 'text-emerald-600',
            trend.direction === 'down' && 'text-rose-600',
            trend.direction === 'stable' && 'text-gray-500'
          )}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Progress Ring
// ============================================================================

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  label?: string
}

export function ProgressRing({ percentage, size = 120, strokeWidth = 8, className, showLabel = true, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Streak Counter
// ============================================================================

interface StreakCounterProps {
  currentStreak: number
  multiplier?: number
}

export function StreakCounter({ currentStreak, multiplier = 1 }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-amber-500 px-4 py-2 text-white shadow-lg">
      <span className="text-lg">🔥</span>
      <div className="flex flex-col">
        <span className="text-sm font-bold leading-tight">{currentStreak} day streak</span>
        {multiplier > 1 && (
          <span className="text-[10px] font-medium opacity-90">{multiplier}x bonus active</span>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Goal Card
// ============================================================================

interface GoalCardProps {
  goal: {
    id: number
    type: string
    title: string
    target_amount: number
    current_amount: number
    currency: string
    deadline: string | null
    status: string
    progress: {
      percentage: number
      on_track: boolean
      days_remaining: number | null
    }
  }
  onClick?: () => void
}

const goalTypeIcons: Record<string, string> = {
  music_video: '🎬',
  album_production: '💿',
  concert: '🎤',
  equipment: '🎸',
  tour: '🚌',
  custom: '🎯',
}

const goalTypeLabels: Record<string, string> = {
  music_video: 'Music Video',
  album_production: 'Album',
  concert: 'Concert',
  equipment: 'Equipment',
  tour: 'Tour',
  custom: 'Custom',
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const icon = goalTypeIcons[goal.type] || '🎯'
  const typeLabel = goalTypeLabels[goal.type] || goal.type
  const pct = Math.min(Math.round(goal.progress.percentage), 100)

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 group"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
              {typeLabel}
            </span>
            {goal.status === 'completed' && (
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                Done
              </span>
            )}
            {goal.status === 'paused' && (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Paused
              </span>
            )}
          </div>
          <h3 className="font-semibold truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {goal.title}
          </h3>

          {/* Amount & Progress */}
          <div className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-lg font-bold tabular-nums">
                {goal.current_amount.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                of {goal.target_amount.toLocaleString()} {goal.currency.toUpperCase()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  goal.progress.on_track
                    ? 'bg-linear-to-r from-emerald-500 to-teal-500'
                    : 'bg-linear-to-r from-amber-500 to-orange-500'
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-medium">{pct}% saved</span>
              {goal.progress.days_remaining !== null && goal.progress.days_remaining > 0 && (
                <span>{goal.progress.days_remaining}d remaining</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// Recommendation Card
// ============================================================================

interface RecommendationCardProps {
  recommendation: {
    id: string
    title: string
    description: string
    type: string
    priority: string
    action: {
      type: string
      impact: {
        monthly_savings: number
        time_to_goal: number
        risk_level: string
      }
    }
    reasoning: string
  }
  onAction?: () => void
}

const recTypeColors: Record<string, string> = {
  strategy: 'border-l-blue-500',
  opportunity: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  milestone: 'border-l-purple-500',
}

const recTypeIcons: Record<string, string> = {
  strategy: '📊',
  opportunity: '💡',
  warning: '⚠️',
  milestone: '🏆',
}

export function RecommendationCard({ recommendation, onAction }: RecommendationCardProps) {
  return (
    <div className={cn(
      'rounded-lg border border-l-4 bg-card p-4 shadow-sm',
      recTypeColors[recommendation.type] || 'border-l-gray-500'
    )}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{recTypeIcons[recommendation.type] || '📋'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{recommendation.title}</h4>
            {recommendation.priority === 'high' && (
              <span className="shrink-0 text-[10px] font-bold uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                High
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{recommendation.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {recommendation.action.impact.time_to_goal !== 0 && (
              <span className="text-emerald-600">
                {recommendation.action.impact.time_to_goal > 0 ? '+' : ''}{recommendation.action.impact.time_to_goal} mo
              </span>
            )}
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] font-medium',
              recommendation.action.impact.risk_level === 'low' && 'bg-emerald-50 text-emerald-600',
              recommendation.action.impact.risk_level === 'medium' && 'bg-amber-50 text-amber-600',
              recommendation.action.impact.risk_level === 'high' && 'bg-rose-50 text-rose-600',
            )}>
              {recommendation.action.impact.risk_level} risk
            </span>
          </div>
          {onAction && (
            <button
              onClick={onAction}
              className="mt-3 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Take Action →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Achievement Badge
// ============================================================================

interface AchievementBadgeProps {
  achievement: {
    title: string
    icon: string
    category: string
    progress: {
      current: number
      target: number
      percentage: number
    }
    unlocked_at?: string
  }
  size?: 'sm' | 'md' | 'lg'
}

export function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  const isUnlocked = !!achievement.unlocked_at
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn(
        'rounded-full flex items-center justify-center transition-all',
        sizeClasses[size],
        isUnlocked
          ? 'bg-linear-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30'
          : 'bg-gray-100 dark:bg-gray-800 opacity-50 grayscale'
      )}>
        {achievement.icon}
      </div>
      <span className="text-xs font-medium text-center leading-tight max-w-20 line-clamp-2">
        {achievement.title}
      </span>
      {!isUnlocked && (
        <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${achievement.progress.percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Empty State
// ============================================================================

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode | {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-dashed bg-muted/20">
      <div className="text-4xl mb-4 opacity-80">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        typeof action === 'object' && action !== null && 'label' in action ? (
          (action as { label: string; href?: string; onClick?: () => void }).href ? (
            <a
              href={(action as { href: string }).href}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {(action as { label: string }).label}
            </a>
          ) : (
            <button
              onClick={(action as { onClick?: () => void }).onClick}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {(action as { label: string }).label}
            </button>
          )
        ) : (
          <div>{action}</div>
        )
      )}
    </div>
  )
}

// ============================================================================
// Planned Feature State
// ============================================================================

interface PlannedFeatureStateProps {
  title: string
  description: string
  phase?: string
}

export function PlannedFeatureState({
  title,
  description,
  phase = 'Planned rebuild',
}: PlannedFeatureStateProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 lg:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {phase}
        </div>

        <div className="mt-4 max-w-2xl space-y-3">
          <h2 className="text-xl font-semibold">This area is not live yet</h2>
          <p className="text-sm text-muted-foreground">
            We paused this SACCO experience while we finish the finance-first rebuild. That keeps the visible product aligned with the backend features that are already stable.
          </p>
          <p className="text-sm text-muted-foreground">
            Current priority remains membership, savings, loans, shares, and goals. This section will come back once its API contract and operating rules are fully defined.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sacco/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/sacco"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            SACCO Home
          </Link>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Section Skeleton
// ============================================================================

export function SaccoSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5">
            <div className="h-3 w-16 bg-muted rounded mb-3" />
            <div className="h-6 w-28 bg-muted rounded mb-2" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="h-4 w-40 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
