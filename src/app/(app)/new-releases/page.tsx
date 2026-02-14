'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import {
  Play,
  Clock,
  Heart,
  MoreHorizontal,
  Loader2,
  Disc3,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Song {
  id: number;
  title: string;
  artist: string;
  artist_id: number;
  album: string;
  cover_image: string;
  duration: number;
  plays: number;
  released_at: string;
}

export default function NewReleasesPage() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');

  const { data, isLoading } = useQuery({
    queryKey: ['songs', 'new-releases', timeFilter],
    queryFn: () => apiGet<{ data: Song[] }>(`/songs?sort=newest&period=${timeFilter}`).then(r => r.data),
  });

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Disc3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">New Releases</h1>
            <p className="text-muted-foreground">Fresh music just dropped</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {([
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'all', label: 'All Time' },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeFilter(value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                timeFilter === value ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Song List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-1">
          {data.map((song, index) => (
            <div
              key={song.id}
              className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span className="w-8 text-center text-sm text-muted-foreground group-hover:hidden">
                {index + 1}
              </span>
              <button className="w-8 hidden group-hover:flex items-center justify-center">
                <Play className="h-4 w-4" />
              </button>

              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                {song.cover_image ? (
                  <Image src={song.cover_image} alt={song.title} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Disc3 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              </div>

              <span className="text-sm text-muted-foreground hidden md:block">{song.album}</span>

              <span className="text-xs text-muted-foreground hidden lg:block">
                {new Date(song.released_at).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                  <Heart className="h-4 w-4" />
                </button>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {formatDuration(song.duration)}
                </span>
                <button className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Disc3 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No new releases</h3>
          <p className="text-muted-foreground">Check back soon for fresh music!</p>
        </div>
      )}
    </div>
  );
}
