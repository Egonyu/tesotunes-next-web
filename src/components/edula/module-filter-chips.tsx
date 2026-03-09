'use client';

import { useRef } from 'react';
import {
  Music,
  Calendar,
  Trophy,
  ShoppingBag,
  Users,
  Star,
  MessageSquare,
  Mic,
  Megaphone,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedModule } from '@/types/edula';

interface ModuleChip {
  key: FeedModule | 'all';
  label: string;
  icon: React.ElementType;
  color: string;
}

const MODULE_CHIPS: ModuleChip[] = [
  { key: 'all', label: 'All', icon: Sparkles, color: '#6B7280' },
  { key: 'music', label: 'Music', icon: Music, color: '#8B5CF6' },
  { key: 'events', label: 'Events', icon: Calendar, color: '#F59E0B' },
  { key: 'awards', label: 'Awards', icon: Trophy, color: '#EF4444' },
  { key: 'store', label: 'Store', icon: ShoppingBag, color: '#10B981' },
  { key: 'sacco', label: 'SACCO', icon: Star, color: '#14B8A6' },
  { key: 'ojokotau', label: 'Ojokotau', icon: Users, color: '#F97316' },
  { key: 'forum', label: 'Forum', icon: MessageSquare, color: '#6366F1' },
  { key: 'podcasts', label: 'Podcasts', icon: Mic, color: '#8B5CF6' },
  { key: 'platform', label: 'Platform', icon: Megaphone, color: '#6B7280' },
];

interface ModuleFilterChipsProps {
  selected: FeedModule | 'all';
  onChange: (module: FeedModule | 'all') => void;
}

export function ModuleFilterChips({ selected, onChange }: ModuleFilterChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group">
      {/* Left scroll button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/90 border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Chips container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none py-1 px-1"
      >
        {MODULE_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const isActive = selected === chip.key;

          return (
            <button
              key={chip.key}
              onClick={() => onChange(chip.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
                isActive
                  ? 'text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
              style={isActive ? { backgroundColor: chip.color } : undefined}
            >
              <Icon className="h-3.5 w-3.5" />
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/90 border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
