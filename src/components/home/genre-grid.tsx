"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Music } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Genre } from "@/types";

const gradientColors = [
  "from-rose-500 to-pink-500",
  "from-orange-500 to-amber-500",
  "from-emerald-500 to-teal-500",
  "from-blue-500 to-indigo-500",
  "from-violet-500 to-purple-500",
  "from-fuchsia-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-lime-500 to-green-500",
];

export function GenreGrid() {
  const { data: genres, isLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const res = await apiGet<{ data: Genre[] }>("/genres");
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const displayGenres = genres || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (displayGenres.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No genres available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {displayGenres.slice(0, 8).map((genre, index) => (
        <Link
          key={genre.id}
          href={`/genres/${genre.slug || genre.id}`}
          className={`relative h-24 rounded-lg overflow-hidden bg-linear-to-br ${
            gradientColors[index % gradientColors.length]
          } group`}
        >
          {/* Genre Image (if available) */}
          {genre.image_url && (
            <Image
              src={genre.image_url}
              alt={genre.name}
              fill
              className="object-cover opacity-60 group-hover:opacity-70 transition-opacity"
            />
          )}

          {/* Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <h3 className="text-lg font-bold text-white drop-shadow-md">
              {genre.name}
            </h3>
            {genre.song_count !== undefined && (
              <p className="text-sm text-white/80">
                {genre.song_count} songs
              </p>
            )}
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  );
}
