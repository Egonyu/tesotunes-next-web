"use client";

import { Compass, TrendingUp, Star, Sparkles } from "lucide-react";
import Link from "next/link";
import { SongGrid } from "@/components/home/song-grid";
import { ArtistCarousel } from "@/components/home/artist-carousel";
import { GenreGrid } from "@/components/home/genre-grid";

const browseCategories = [
  {
    id: "trending",
    name: "Trending Now",
    description: "What's hot right now",
    icon: TrendingUp,
    color: "from-orange-500 to-red-500",
    href: "/browse/trending",
  },
  {
    id: "new",
    name: "New Releases",
    description: "Fresh music just dropped",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    href: "/browse/new-releases",
  },
  {
    id: "charts",
    name: "Top Charts",
    description: "The most played tracks",
    icon: Star,
    color: "from-yellow-500 to-orange-500",
    href: "/browse/charts",
  },
  {
    id: "discover",
    name: "Discover Weekly",
    description: "Personalized for you",
    icon: Compass,
    color: "from-green-500 to-teal-500",
    href: "/browse/discover",
  },
];

export default function BrowsePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Compass className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Browse</h1>
          <p className="text-muted-foreground">
            Discover new music and explore our collection
          </p>
        </div>
      </div>

      {/* Browse Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {browseCategories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className={`relative rounded-xl bg-linear-to-br ${category.color} p-6 text-white overflow-hidden group hover:scale-[1.02] transition-transform`}
          >
            <div className="relative z-10">
              <category.icon className="h-8 w-8 mb-4" />
              <h3 className="text-xl font-bold mb-1">{category.name}</h3>
              <p className="text-white/80 text-sm">{category.description}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform" />
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-3 mb-12">
        <Link
          href="/genres"
          className="px-6 py-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors font-medium"
        >
          All Genres
        </Link>
        <Link
          href="/artists"
          className="px-6 py-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors font-medium"
        >
          All Artists
        </Link>
        <Link
          href="/albums"
          className="px-6 py-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors font-medium"
        >
          All Albums
        </Link>
        <Link
          href="/playlists"
          className="px-6 py-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors font-medium"
        >
          All Playlists
        </Link>
        <Link
          href="/podcasts"
          className="px-6 py-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors font-medium"
        >
          Podcasts
        </Link>
      </div>

      {/* Genres Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Genres</h2>
          <Link
            href="/genres"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            See all
          </Link>
        </div>
        <GenreGrid />
      </section>

      {/* Trending Artists */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Trending Artists</h2>
          <Link
            href="/artists"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            See all
          </Link>
        </div>
        <ArtistCarousel />
      </section>

      {/* Popular Songs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Popular Songs</h2>
          <Link
            href="/search"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            See all
          </Link>
        </div>
        <SongGrid type="trending" />
      </section>
    </div>
  );
}
