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
      const res = await apiGet<{ data: Genre[] }>("/api/genres");
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const displayGenres = genres || [
    { id: 1, name: "Afrobeat", slug: "afrobeat", song_count: 245 },
    { id: 2, name: "Bongo Flava", slug: "bongo-flava", song_count: 189 },
    { id: 3, name: "Kadongo Kamu", slug: "kadongo-kamu", song_count: 156 },
    { id: 4, name: "Gospel", slug: "gospel", song_count: 312 },
    { id: 5, name: "Hip Hop", slug: "hip-hop", song_count: 201 },
    { id: 6, name: "Dancehall", slug: "dancehall", song_count: 134 },
    { id: 7, name: "RnB", slug: "rnb", song_count: 178 },
    { id: 8, name: "Traditional", slug: "traditional", song_count: 89 },
  ];

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
