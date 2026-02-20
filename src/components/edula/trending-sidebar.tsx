'use client';

import Link from 'next/link';
import { Hash } from 'lucide-react';
import { formatNumber } from './post-card';

interface TrendingTopic {
  tag: string;
  posts: number;
  category?: string;
}

interface TrendingSidebarProps {
  topics: TrendingTopic[];
}

export function TrendingSidebar({ topics }: TrendingSidebarProps) {
  if (topics.length === 0) return null;

  return (
    <div className="p-4 rounded-xl border bg-card">
      <h3 className="font-semibold mb-4">Trending</h3>
      <div className="space-y-3">
        {topics.map((trend) => (
          <Link
            key={trend.tag}
            href={`/search?q=${encodeURIComponent(trend.tag)}`}
            className="block hover:bg-muted -mx-2 px-2 py-2 rounded-lg transition-colors"
          >
            {trend.category && (
              <p className="text-[11px] text-muted-foreground font-medium">{trend.category}</p>
            )}
            <p className="font-medium text-sm flex items-center gap-1">
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
              {trend.tag.replace(/^#/, '')}
            </p>
            <p className="text-xs text-muted-foreground">{formatNumber(trend.posts)} posts</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
