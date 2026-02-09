"use client";

import { useState } from "react";
import { useSearch } from "@/hooks";
import { Search as SearchIcon, X, Loader2, Music, User, Disc } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePlayerStore } from "@/stores";
import type { Song } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { play } = usePlayerStore();
  
  const { data, isLoading } = useSearch(query);

  return (
    <div className="p-6">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full pl-12 pr-12 py-4 rounded-full bg-muted text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {query.length >= 2 && data && (
        <div className="space-y-8">
          {/* Songs */}
          {data.songs && data.songs.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Songs</h2>
              <div className="space-y-2">
                {data.songs.slice(0, 5).map((song) => (
                  <button
                    key={song.id}
                    onClick={() => play(song, data.songs)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                      {song.artwork_url ? (
                        <Image
                          src={song.artwork_url}
                          alt={song.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Music className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.artist?.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {data.artists && data.artists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {data.artists.slice(0, 6).map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artists/${artist.slug || artist.id}`}
                    className="text-center group"
                  >
                    <div className="relative aspect-square mb-3 overflow-hidden rounded-full bg-muted">
                      {artist.profile_image_url ? (
                        <Image
                          src={artist.profile_image_url}
                          alt={artist.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {artist.name}
                    </p>
                    <p className="text-sm text-muted-foreground">Artist</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {data.albums && data.albums.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {data.albums.slice(0, 5).map((album) => (
                  <Link
                    key={album.id}
                    href={`/albums/${album.slug || album.id}`}
                    className="group"
                  >
                    <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-muted">
                      {album.artwork_url ? (
                        <Image
                          src={album.artwork_url}
                          alt={album.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Disc className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {album.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {album.artist?.name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* No results */}
          {!data.songs?.length && !data.artists?.length && !data.albums?.length && (
            <div className="text-center py-12 text-muted-foreground">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-2">Try different keywords or check the spelling</p>
            </div>
          )}
        </div>
      )}

      {/* Browse when no query */}
      {query.length < 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Browse All</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "Afrobeat", color: "from-orange-500 to-red-500" },
              { name: "Gospel", color: "from-purple-500 to-pink-500" },
              { name: "Hip Hop", color: "from-green-500 to-teal-500" },
              { name: "RnB", color: "from-blue-500 to-indigo-500" },
              { name: "Dancehall", color: "from-yellow-500 to-orange-500" },
              { name: "Traditional", color: "from-emerald-500 to-green-500" },
              { name: "Bongo Flava", color: "from-rose-500 to-pink-500" },
              { name: "Kadongo Kamu", color: "from-cyan-500 to-blue-500" },
            ].map((genre) => (
              <Link
                key={genre.name}
                href={`/genres/${genre.name.toLowerCase().replace(" ", "-")}`}
                className={`h-32 rounded-lg bg-linear-to-br ${genre.color} p-4 flex items-end hover:scale-105 transition-transform`}
              >
                <span className="text-white font-bold text-lg">{genre.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
