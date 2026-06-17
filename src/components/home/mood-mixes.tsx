"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { SnapCarousel, SnapCarouselItem } from "@/components/ui/snap-carousel";
import { moodIcon } from "@/lib/mood-icons";

// Matches MoodController::index().
interface Mood {
  id: number;
  name: string;
  slug: string;
  color: string;
  artwork_url?: string | null;
  song_count: number;
}

/**
 * "Popular mixes" — mood-based mixes (Spotify-style) as an auto-sliding row.
 */
export function MoodMixes() {
  const { data: moods, isLoading } = useQuery({
    queryKey: ["moods"],
    queryFn: () => apiGet<{ data: Mood[] }>("/content/moods").then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <SnapCarousel arrows>
        {Array.from({ length: 6 }).map((_, i) => (
          <SnapCarouselItem key={i} className="sm:w-44">
            <div className="aspect-square animate-pulse rounded-xl bg-muted" />
          </SnapCarouselItem>
        ))}
      </SnapCarousel>
    );
  }

  if (!moods || moods.length === 0) return null;

  return (
    <SnapCarousel autoPlay arrows>
      {moods.map((mood) => {
        const Icon = moodIcon(mood.slug);
        return (
          <SnapCarouselItem key={mood.id} className="sm:w-44">
            <Link href={`/moods/${mood.slug}`} className="group block">
              <div
                className="relative aspect-square overflow-hidden rounded-xl p-4 shadow-sm transition-transform group-hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${mood.color}, ${mood.color}80)` }}
              >
                <div className="flex h-full flex-col justify-between text-white">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                  <div>
                    <p className="font-bold leading-tight drop-shadow-sm">{mood.name}</p>
                    <p className="text-xs text-white/85">{mood.song_count} songs</p>
                  </div>
                </div>
              </div>
            </Link>
          </SnapCarouselItem>
        );
      })}
    </SnapCarousel>
  );
}
