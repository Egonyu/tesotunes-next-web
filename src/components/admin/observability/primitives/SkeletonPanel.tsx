'use client';

import { Skeleton } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

interface SkeletonPanelProps {
  rows?: number;
  className?: string;
  caption?: string;
}

export function SkeletonPanel({ rows = 4, className, caption }: SkeletonPanelProps) {
  return (
    <div className={cn('space-y-3 rounded-2xl border bg-card p-4 shadow-sm', className)} aria-busy>
      {caption ? <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{caption}</div> : null}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
