import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Music } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Genre } from "@/types";

const gradientColors = [
  "from-rose-500 to-pink-600",
  "from-orange-500 to-amber-600",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-fuchsia-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-lime-500 to-green-600",
  "from-red-500 to-rose-600",
  "from-amber-500 to-yellow-600",
  "from-teal-500 to-cyan-600",
  "from-indigo-500 to-blue-600",
];

async function getGenres(): Promise<Genre[]> {
  try {
    const res = await serverFetch<{ data: Genre[] }>("/api/genres");
    return res.data || [];
  } catch {
    return [];
  }
}

function GenreCard({ genre, index }: { genre: Genre; index: number }) {
  const gradient = gradientColors[index % gradientColors.length];

  return (
    <Link
      href={`/genres/${genre.slug || genre.id}`}
      className={`relative h-36 md:h-44 rounded-xl overflow-hidden bg-linear-to-br ${gradient} group transition-transform hover:scale-[1.02]`}
    >
      {/* Background Image (if available) */}
      {genre.image_url && (
        <Image
          src={genre.image_url}
          alt={genre.name}
          fill
          className="object-cover opacity-40 group-hover:opacity-50 transition-opacity"
        />
      )}

      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
          {genre.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/80">
            {genre.song_count || 0} songs
          </span>
          <div className="h-8 w-8 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Music className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function GenreGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-36 md:h-44 bg-muted rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

async function GenreGrid() {
  const genres = await getGenres();

  if (genres.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No genres available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {genres.map((genre, index) => (
        <GenreCard key={genre.id} genre={genre} index={index} />
      ))}
    </div>
  );
}

export default function GenresPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Genres</h1>
        <p className="text-muted-foreground mt-1">
          Explore music by genre and discover new sounds
        </p>
      </div>

      {/* Popular Genres */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Popular Genres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Afrobeat", slug: "afrobeat", color: "from-orange-500 to-red-600" },
            { name: "Gospel", slug: "gospel", color: "from-purple-500 to-pink-600" },
            { name: "Hip Hop", slug: "hip-hop", color: "from-green-500 to-teal-600" },
          ].map((genre) => (
            <Link
              key={genre.slug}
              href={`/genres/${genre.slug}`}
              className={`relative h-32 rounded-xl overflow-hidden bg-linear-to-br ${genre.color} group`}
            >
              <div className="absolute inset-0 p-5 flex items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">{genre.name}</h3>
                  <p className="text-white/70 text-sm mt-1">Top picks for you</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Music className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Genres */}
      <section>
        <h2 className="text-xl font-bold mb-4">All Genres</h2>
        <Suspense fallback={<GenreGridSkeleton />}>
          <GenreGrid />
        </Suspense>
      </section>
    </div>
  );
}
