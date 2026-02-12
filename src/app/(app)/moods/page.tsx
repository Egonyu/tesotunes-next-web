"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Music, Play } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

interface Mood {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  gradient?: string;
  icon?: string;
  image_url?: string;
  songs_count: number;
  playlists_count: number;
}

const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  energetic: "⚡",
  chill: "😌",
  romantic: "💕",
  focused: "🎯",
  party: "🎉",
  workout: "💪",
  sleep: "😴",
  angry: "😤",
  peaceful: "🕊️",
  nostalgic: "📷",
  confident: "👑",
  melancholic: "🌧️",
};

export default function MoodsPage() {
  const { data: moods, isLoading } = useQuery({
    queryKey: ["moods"],
    queryFn: () => apiGet<Mood[]>("/api/content/moods"),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Sparkles className="h-5 w-5" />
          Music for Every Mood
        </div>
        <h1 className="text-4xl font-bold mb-2">Browse by Mood</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find the perfect soundtrack for how you're feeling right now
        </p>
      </div>

      {/* Featured Moods */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
        {moods?.slice(0, 8).map((mood) => {
          const emoji = moodEmojis[mood.slug] || "🎵";
          return (
            <Link
              key={mood.id}
              href={`/moods/${mood.slug}`}
              className="group relative aspect-square rounded-2xl overflow-hidden"
              style={{
                background: mood.gradient || `linear-gradient(135deg, ${mood.color}, ${mood.color}80)`,
              }}
            >
              {mood.image_url && (
                <Image
                  src={mood.image_url}
                  alt={mood.name}
                  fill
                  className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <span className="text-4xl mb-2">{emoji}</span>
                <h3 className="text-xl font-bold text-center">{mood.name}</h3>
                <p className="text-sm text-white/80 mt-1">
                  {formatNumber(mood.songs_count)} songs
                </p>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Play className="h-6 w-6 text-black ml-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* All Moods */}
      {moods && moods.length > 8 && (
        <>
          <h2 className="text-2xl font-bold mb-6">All Moods</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {moods.slice(8).map((mood) => {
              const emoji = moodEmojis[mood.slug] || "🎵";
              return (
                <Link
                  key={mood.id}
                  href={`/moods/${mood.slug}`}
                  className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-primary transition-colors group"
                >
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${mood.color}20` }}
                  >
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{mood.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(mood.songs_count)} songs
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Quick Suggestions */}
      <div className="mt-12 bg-linear-to-r from-primary/10 to-primary/5 rounded-2xl p-8">
        <h3 className="text-xl font-bold mb-4">Not sure what mood you're in?</h3>
        <p className="text-muted-foreground mb-6">
          Let us suggest some music based on the time of day
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/moods/chill"
            className="px-4 py-2 bg-background rounded-full border hover:border-primary transition-colors"
          >
            😌 Chill Vibes
          </Link>
          <Link
            href="/moods/energetic"
            className="px-4 py-2 bg-background rounded-full border hover:border-primary transition-colors"
          >
            ⚡ Energy Boost
          </Link>
          <Link
            href="/moods/focused"
            className="px-4 py-2 bg-background rounded-full border hover:border-primary transition-colors"
          >
            🎯 Deep Focus
          </Link>
          <Link
            href="/moods/happy"
            className="px-4 py-2 bg-background rounded-full border hover:border-primary transition-colors"
          >
            😊 Good Vibes
          </Link>
        </div>
      </div>
    </div>
  );
}
