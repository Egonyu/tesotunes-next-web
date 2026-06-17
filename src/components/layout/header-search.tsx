"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Music, User, Disc } from "lucide-react";
import { useSearch } from "@/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlayerStore } from "@/stores";
import { SafeImage, InitialsAvatar } from "@/components/ui/safe-image";

export function HeaderSearch() {
  const router = useRouter();
  const { play } = usePlayerStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query.trim(), 250);
  const { data, isLoading } = useSearch(debouncedQuery);

  const songs = data?.songs ?? [];
  const artists = data?.artists ?? [];
  const albums = data?.albums ?? [];
  const hasResults = songs.length > 0 || artists.length > 0 || albums.length > 0;
  const showDropdown = open && query.trim().length >= 2;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function goToResults() {
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    goToResults();
  }

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={handleSubmit}
        role="search"
        className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-primary hover:bg-muted/80 md:w-72"
      >
        <button
          type="submit"
          aria-label="Search"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Search className="h-4 w-4" />
        </button>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search songs, artists, albums..."
          aria-label="Search songs, artists, albums"
          className="hidden w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none md:block [&::-webkit-search-cancel-button]:appearance-none"
        />
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border/80 bg-background p-2 shadow-xl md:w-96">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query.trim()}&rdquo;
            </div>
          )}

          {!isLoading && songs.length > 0 && (
            <section className="mb-1">
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Songs
              </p>
              {songs.slice(0, 4).map((song) => (
                <button
                  key={`song-${song.id}`}
                  onClick={() => {
                    play(song, songs);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    {song.artwork_url ? (
                      <SafeImage
                        src={song.artwork_url}
                        alt={song.title}
                        fill
                        className="object-cover"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center">
                            <Music className="h-4 w-4 text-muted-foreground" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Music className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{song.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{song.artist?.name}</p>
                  </div>
                </button>
              ))}
            </section>
          )}

          {!isLoading && artists.length > 0 && (
            <section className="mb-1">
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Artists
              </p>
              {artists.slice(0, 3).map((artist) => (
                <button
                  key={`artist-${artist.id}`}
                  onClick={() => {
                    router.push(`/artists/${artist.slug || artist.id}`);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                    {artist.avatar_url ? (
                      <SafeImage
                        src={artist.avatar_url}
                        alt={artist.name}
                        fill
                        className="object-cover"
                        fallback={<InitialsAvatar name={artist.name} textClassName="text-xs" />}
                      />
                    ) : (
                      <InitialsAvatar name={artist.name} textClassName="text-xs" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{artist.name}</p>
                    <p className="truncate text-xs text-muted-foreground">Artist</p>
                  </div>
                </button>
              ))}
            </section>
          )}

          {!isLoading && albums.length > 0 && (
            <section className="mb-1">
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Albums
              </p>
              {albums.slice(0, 3).map((album) => (
                <button
                  key={`album-${album.id}`}
                  onClick={() => {
                    router.push(`/albums/${album.slug || album.id}`);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    {album.artwork_url ? (
                      <SafeImage
                        src={album.artwork_url}
                        alt={album.title}
                        fill
                        className="object-cover"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center">
                            <Disc className="h-4 w-4 text-muted-foreground" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Disc className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{album.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{album.artist?.name}</p>
                  </div>
                </button>
              ))}
            </section>
          )}

          {!isLoading && hasResults && (
            <button
              onClick={goToResults}
              className="mt-1 w-full rounded-xl px-3 py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-muted"
            >
              See all results for &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
