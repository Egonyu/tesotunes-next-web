'use client';

import Link from 'next/link';
import { Lock, Zap, Download, Upload, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FeatureKey = 'downloads' | 'uploads' | 'quality';

interface FeatureGateProps {
  feature: FeatureKey;
  used: number;
  /** null means unlimited */
  limit: number | null;
  planName?: string;
  className?: string;
}

const FEATURE_META: Record<FeatureKey, { label: string; unit: string; icon: React.ElementType }> = {
  downloads: { label: 'Downloads', unit: 'today', icon: Download },
  uploads: { label: 'Uploads', unit: 'this month', icon: Upload },
  quality: { label: 'Audio Quality', unit: 'kbps', icon: Music },
};

/**
 * Shows a quota bar + contextual upgrade prompt for a subscription-limited feature.
 *
 * Usage examples:
 *   <FeatureGate feature="downloads" used={7} limit={10} planName="Free" />
 *   <FeatureGate feature="uploads" used={4} limit={5} planName="Artist" />
 */
export function FeatureGate({ feature, used, limit, planName, className }: FeatureGateProps) {
  // Unlimited — render nothing
  if (limit === null || limit <= 0) return null;

  const meta = FEATURE_META[feature];
  const Icon = meta.icon;
  const percentage = Math.min((used / limit) * 100, 100);
  const isAtLimit = used >= limit;
  const isNearLimit = percentage >= 80 && !isAtLimit;
  const remaining = Math.max(limit - used, 0);

  const barColor = isAtLimit
    ? 'bg-red-500'
    : isNearLimit
    ? 'bg-amber-500'
    : 'bg-primary';

  const containerColor = isAtLimit
    ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
    : isNearLimit
    ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40'
    : 'border-border bg-card';

  return (
    <div className={cn('rounded-xl border p-4', containerColor, className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isAtLimit ? (
            <Lock className="h-4 w-4 text-red-500 shrink-0" />
          ) : (
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="text-sm font-medium">
            {meta.label}
          </span>
        </div>
        <span className={cn(
          'text-xs font-semibold',
          isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
        )}>
          {used} / {limit} {meta.unit}
        </span>
      </div>

      {/* Quota bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Messages */}
      {isAtLimit && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            Limit reached for {planName ?? 'your plan'}.
          </p>
          <Link
            href="/pricing"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            <Zap className="h-3 w-3" />
            Upgrade
          </Link>
        </div>
      )}

      {isNearLimit && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {remaining} {meta.label.toLowerCase()} remaining {meta.unit}.
          </p>
          <Link
            href="/pricing"
            className="text-xs font-semibold text-primary hover:underline shrink-0"
          >
            Upgrade plan →
          </Link>
        </div>
      )}
    </div>
  );
}
