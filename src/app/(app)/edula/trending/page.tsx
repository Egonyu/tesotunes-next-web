'use client';

import { useState } from 'react';
import { Flame, Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useTrending,
} from '@/hooks/useFeed';
import type { TrendingItem } from '@/types/edula';

export default function TrendingFeedPage() {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

  // API hooks
  const { data: trendingData, isLoading } = useTrending();

  const items: TrendingItem[] = trendingData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          <h1 className="text-xl font-bold">Trending</h1>
        </div>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {(['today', 'week', 'month'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                timeFilter === filter
                  ? 'bg-background shadow'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Items */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium">No trending topics yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later to see what&apos;s popular on TesoTunes
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
            >
              <span className="text-2xl font-bold text-muted-foreground w-8 text-center">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.title}</p>
                {item.subtitle && (
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                <TrendingUp className="h-4 w-4" />
                <span>{(item.count ?? 0).toLocaleString()}</span>
              </div>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full capitalize',
                item.type === 'song' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                item.type === 'artist' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                item.type === 'hashtag' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
              )}>
                {item.type}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
